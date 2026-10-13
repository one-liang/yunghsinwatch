import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../src/js/component/header.js", import.meta.url), "utf8");

function events(extra = {}) {
  const listeners = new Map();
  return {
    ...extra,
    addEventListener(name, callback) {
      const handlers = listeners.get(name) ?? [];
      handlers.push(callback);
      listeners.set(name, handlers);
    },
    emit(name, event = {}) {
      for (const callback of listeners.get(name) ?? []) callback(event);
    },
  };
}

function setup({
  y = 0,
  reduced = false,
  desktop = true,
  missing = false,
  brandBottom = 76,
  headerHeight = 172,
  dropdownTop = 116,
} = {}) {
  const classes = new Set();
  const frames = [];
  const timelines = [];
  const queries = {
    "(min-width: 64rem)": events({ matches: desktop }),
    "(prefers-reduced-motion: reduce)": events({ matches: reduced }),
  };
  let reads = 0;
  let languageChanged;
  // 展開時背景高 headerHeight（預設 172），子選單 li 頂端在 dropdownTop；
  // 收合時背景一律 88px 高、li 頂端在 18。
  const bottoms = { background: [headerHeight, 88], "brand-text": [brandBottom, brandBottom] };
  const heights = { background: [headerHeight, 88] };
  const tops = { dropdown: [dropdownTop, 18] };
  const parts = Object.fromEntries(
    ["background", "brand-text", "logo", "nav > ul", "actions", "dropdown"].map((name) => [
      `.site-header__${name}`,
      events({
        getBoundingClientRect() {
          reads++;
          // 和 CSS 一樣：量測中、或沒有 timeline 時的捲動狀態都是收合布局。
          const compact =
            classes.has("is-measuring-compact") ||
            (classes.has("is-scrolled") && !classes.has("has-header-motion"));
          const state = compact ? 1 : 0;
          return {
            left: compact ? 80 : 0,
            top: tops[name]?.[state] ?? (compact ? 16 : 100),
            width: compact ? 106 : 140,
            height: heights[name]?.[state] ?? (compact ? 56 : 74),
            bottom: bottoms[name]?.[state] ?? 174,
          };
        },
      }),
    ])
  );
  const style = new Map();
  const header = {
    style: {
      setProperty: (name, value) => style.set(name, value),
      removeProperty: (name) => style.delete(name),
    },
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle(name, value) {
        if (value) classes.add(name);
        else classes.delete(name);
      },
    },
    querySelector: (selector) => parts[selector] ?? null,
    querySelectorAll: () => [],
  };
  const gsap = {
    set() {},
    timeline(options) {
      const timeline = {
        options,
        tweens: [],
        fromTos: [],
        value: 0,
        transitions: [],
        to(target, values, position) {
          this.tweens.push({ target, values, position });
          return this;
        },
        fromTo(target, from, to, position) {
          this.fromTos.push({ target, from, to, position });
          return this;
        },
        progress(value) {
          this.value = value;
          return this;
        },
        pause() {
          return this;
        },
        duration() {
          return this.options.defaults.duration;
        },
        tweenTo(destination, options) {
          const transition = {
            destination,
            options,
            kill() {
              this.killed = true;
            },
          };
          this.transitions.push(transition);
          return transition;
        },
        kill() {
          this.killed = true;
        },
      };
      timelines.push(timeline);
      return timeline;
    },
  };
  const window = events({
    scrollY: y,
    gsap: missing ? undefined : gsap,
    CustomEase: { create: (_name, curve) => curve },
    matchMedia: (query) => queries[query],
    requestAnimationFrame: (callback) => frames.push(callback),
  });
  const document = events({
    readyState: "complete",
    documentElement: {},
    querySelector: () => header,
  });
  class MutationObserver {
    constructor(callback) {
      languageChanged = callback;
    }
    observe() {}
  }
  vm.runInNewContext(source, { window, document, MutationObserver });
  return {
    window,
    header,
    style,
    classes,
    queries,
    timelines,
    parts,
    get reads() {
      return reads;
    },
    languageChanged: () => languageChanged(),
    scroll(y) {
      window.scrollY = y;
      window.emit("scroll");
      frames.splice(0).forEach((callback) => callback());
    },
  };
}

test("header expands and collapses with identical timing and easing without layout reads", () => {
  const env = setup();
  const timeline = env.timelines[0];
  const reads = env.reads;
  env.scroll(160);
  assert.equal(timeline.transitions.length, 0);
  env.scroll(161);
  assert.equal(timeline.transitions.length, 1);
  assert.equal(timeline.transitions[0].destination, 1);
  timeline.value = 0.4;
  env.scroll(100);
  assert.equal(timeline.transitions.length, 1);
  env.scroll(79);
  assert.equal(timeline.transitions.length, 2);
  assert.equal(timeline.transitions[1].destination, 0);
  assert.ok(timeline.transitions[0].killed);
  for (const transition of timeline.transitions) {
    assert.equal(transition.options.duration, 1);
    assert.equal(transition.options.ease, "0.25,0.1,0.25,1");
  }
  assert.equal(timeline.value, 0.4, "reverse must retain the current position");
  assert.equal(env.reads, reads, "scroll handlers must not read layout");
  assert.equal(env.timelines.length, 1);
  assert.equal(timeline.options.defaults.duration, 1);
  assert.equal(timeline.options.defaults.ease, "none", "easing belongs to the directional tween");
  assert.ok(timeline.tweens.every(({ position }) => position === 0));
  assert.ok(timeline.tweens.every(({ values }) => values.force3D === true));
  const brand = timeline.tweens.find(
    ({ target }) => target === env.parts[".site-header__brand-text"]
  );
  assert.ok(
    brand.values.duration > 0 && brand.values.duration <= 0.4,
    "brand must remain hidden until nav clears it on expansion"
  );
});

test("taller translated brand text waits longer for navigation clearance", () => {
  const regular = setup({ brandBottom: 76 });
  const taller = setup({ brandBottom: 86 });
  const fadeDuration = (env) =>
    env.timelines[0].tweens.find(({ target }) => target === env.parts[".site-header__brand-text"])
      .values.duration;
  assert.ok(fadeDuration(taller) < fadeDuration(regular));
});

test("mid-page initialization and restored position synchronize without playing", () => {
  const env = setup({ y: 500 });
  assert.ok(env.classes.has("is-scrolled"));
  assert.equal(env.timelines[0].value, 1);
  assert.equal(env.timelines[0].transitions.length, 0);
  env.window.scrollY = 0;
  env.window.emit("pageshow");
  assert.equal(env.timelines.at(-1).value, 0);
  assert.ok(env.timelines[0].killed);
  assert.ok(env.timelines[0].transitions[0].killed);
});

test("resize and language changes remeasure endpoints and preserve the target state", () => {
  const env = setup({ y: 500 });
  env.window.emit("resize");
  env.languageChanged();
  env.parts[".site-header__logo"].emit("load");
  assert.equal(env.timelines.length, 4);
  assert.ok(env.timelines.slice(0, -1).every((timeline) => timeline.killed));
  assert.equal(env.timelines.at(-1).value, 1);
  assert.equal(env.classes.has("is-measuring-compact"), false);
});

test("reduced motion, mobile and missing GSAP retain static functional states", () => {
  for (const options of [{ reduced: true }, { desktop: false }, { missing: true }]) {
    const env = setup(options);
    env.scroll(500);
    assert.equal(env.timelines.length, 0);
    assert.ok(env.classes.has("is-scrolled"));
    assert.equal(env.classes.has("has-header-motion"), false);
  }
  const env = setup({ y: 500 });
  const reduced = env.queries["(prefers-reduced-motion: reduce)"];
  reduced.matches = true;
  reduced.emit("change");
  assert.ok(env.timelines[0].killed);
  assert.equal(env.classes.has("has-header-motion"), false);
  reduced.matches = false;
  reduced.emit("change");
  assert.equal(env.timelines.at(-1).value, 1);
  const desktop = env.queries["(min-width: 64rem)"];
  desktop.matches = false;
  desktop.emit("change");
  assert.equal(env.classes.has("has-header-motion"), false);
});

const SUBMENU_TOP = "--site-header-submenu-top";

test("background shrinks to the measured compact height instead of a fixed ratio", () => {
  const scaleOf = (env) =>
    env.timelines[0].tweens.find(({ target }) => target === env.parts[".site-header__background"])
      .values.scaleY;
  assert.equal(scaleOf(setup()), 88 / 172);
  // 展開高度不是 172px 時（例如本來就是 88px），比例跟著量測，不能縮成 45px（修改清單 #3）。
  const compactPage = setup({ headerHeight: 88, dropdownTop: 18 });
  assert.equal(scaleOf(compactPage), 1);
  const [{ from, to }] = compactPage.timelines[0].fromTos;
  assert.equal(from[SUBMENU_TOP], "70px");
  assert.equal(to[SUBMENU_TOP], "70px");
});

test("CSS sizes the compact background by height so compact headers keep 88px", async () => {
  const css = await readFile(
    new URL("../src/components/header/header.css", import.meta.url),
    "utf8"
  );
  assert.match(css, /\.site-header__background\s*\{\s*bottom: auto;\s*height: 88px;/);
  assert.doesNotMatch(css, /scaleY\(calc\(88 \/ 172\)\)/);
});

test("submenu offset tweens with the timeline from the full to the compact header bottom", () => {
  const env = setup();
  const [timeline] = env.timelines;
  assert.equal(timeline.fromTos.length, 1);
  // 物件是在 vm context 裡建立的，原型不同，所以逐欄比對。
  const [{ target, from, to, position }] = timeline.fromTos;
  assert.equal(target, env.header);
  assert.equal(from[SUBMENU_TOP], "56px", "li top 116 to full header bottom 172");
  assert.equal(to[SUBMENU_TOP], "70px", "li top 18 to compact header bottom 88");
  assert.equal(position, 0);
  assert.equal(env.style.has(SUBMENU_TOP), false, "the timeline owns the inline value");
  const reads = env.reads;
  env.scroll(500);
  assert.equal(env.reads, reads, "scroll handlers must not read layout");
});

test("without a timeline the submenu offset follows the current static layout", () => {
  for (const options of [{ reduced: true }, { missing: true }]) {
    const env = setup(options);
    assert.equal(env.style.get(SUBMENU_TOP), "56px");
    env.scroll(500);
    assert.equal(env.style.get(SUBMENU_TOP), "70px");
    env.scroll(0);
    assert.equal(env.style.get(SUBMENU_TOP), "56px");
  }
  const mobile = setup({ desktop: false });
  mobile.scroll(500);
  assert.equal(mobile.style.has(SUBMENU_TOP), false);

  // 從靜態切回 timeline 時，要先清掉靜態量到的值，不能殘留到動畫裡。
  const env = setup({ y: 500, reduced: true });
  assert.equal(env.style.get(SUBMENU_TOP), "70px");
  const reduced = env.queries["(prefers-reduced-motion: reduce)"];
  reduced.matches = false;
  reduced.emit("change");
  assert.equal(env.style.has(SUBMENU_TOP), false);
  assert.equal(env.timelines.at(-1).fromTos.length, 1);
});

test("CSS anchors the submenu to the measured offset but never above its button", async () => {
  const css = await readFile(
    new URL("../src/components/header/header.css", import.meta.url),
    "utf8"
  );
  assert.match(
    css,
    /\.site-header__submenu\s*\{[^}]*top: max\(100%, var\(--site-header-submenu-top, 100%\)\)/
  );
  assert.match(
    css,
    /\.site-header__dropdown::after\s*\{[^}]*height: calc\(var\(--site-header-submenu-top, 100%\) - 100%\)/
  );
});

test("CSS keeps the desktop spacer stable and leaves fixed overlays outside transforms", async () => {
  const css = await readFile(
    new URL("../src/components/header/header.css", import.meta.url),
    "utf8"
  );
  assert.match(css, /height: 172px/);
  assert.doesNotMatch(css, /transition:\s*(?:height|width|max-width)/);
  assert.doesNotMatch(css, /\.site-header\s*\{[^}]*transform:/);
  assert.match(css, /\.booking-modal\s*\{\s*pointer-events: auto/);
});

test("top-edge overscroll cannot reveal the white page canvas", async () => {
  const css = await readFile(new URL("../src/styles/tailwind.css", import.meta.url), "utf8");
  assert.match(css, /html\s*\{[^}]*background-color:\s*#000/);
  assert.match(css, /html\s*\{[^}]*overscroll-behavior-y:\s*none/);
});
