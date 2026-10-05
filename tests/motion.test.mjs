import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../src/js/global/motion.js", import.meta.url), "utf8");

function eventTarget(extra = {}) {
  const listeners = new Map();
  return {
    ...extra,
    addEventListener(name, handler) {
      const handlers = listeners.get(name) ?? [];
      handlers.push(handler);
      listeners.set(name, handlers);
    },
    emit(name, event = {}) {
      for (const handler of listeners.get(name) ?? []) handler(event);
    },
  };
}

function setup({ reduced = false, missing = false, missingLenis = false } = {}) {
  const callbacks = new Set();
  const instances = [];
  const tweens = [];
  const observers = [];
  const frames = new Map();
  const mediaQuery = eventTarget({ matches: reduced });
  const element = {
    getBoundingClientRect: () => ({ top: 400, height: 200 }),
    scrollIntoView(options) {
      this.nativeScroll = options;
    },
  };
  // 進場目標：一個文字群組（三個項目）與一個媒體。
  const items = [{ name: "over-title" }, { name: "title" }, { name: "body" }];
  const group = { querySelectorAll: () => items };
  const mediaElement = { name: "media" };
  const selectors = { "[data-reveal-group]": [group], "[data-reveal-media]": [mediaElement] };
  const body = { locked: false, classList: { contains: () => body.locked } };
  let runMedia;
  let refreshes = 0;
  let resizeTimer = null;
  const resizeObservers = [];
  const document = eventTarget({
    readyState: "complete",
    body,
    documentElement: {},
    querySelectorAll: (selector) => selectors[selector] ?? [],
  });
  const window = eventTarget({
    innerHeight: 800,
    scrollY: 100,
    matchMedia: () => mediaQuery,
    requestAnimationFrame: (callback) => {
      const id = frames.size + 1;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    CustomEase: { create: () => "css-ease" },
    ScrollTrigger: {
      update() {},
      refresh: () => refreshes++,
      config(options) {
        this.options = options;
      },
    },
    setTimeout: (callback) => (resizeTimer = callback),
    clearTimeout() {},
    gsap: {
      registerPlugin() {},
      ticker: {
        lagSmoothing() {},
        add: (callback) => callbacks.add(callback),
        remove: (callback) => callbacks.delete(callback),
      },
      matchMedia: () => ({
        add(conditions, callback) {
          assert.equal(conditions.all, "all", "ordinary mobile must also initialize reveals");
          runMedia = () => callback({ conditions: { reduced: mediaQuery.matches } });
          runMedia();
        },
      }),
      fromTo: (target, from, to) => tweens.push({ target, from, to }),
    },
  });
  class Lenis {
    constructor(options) {
      this.options = options;
      this.isStopped = false;
      this.isScrolling = false;
      this.resizes = 0;
      instances.push(this);
    }
    on(name, callback) {
      this.scrollHandler = callback;
    }
    raf(time) {
      this.time = time;
    }
    resize() {
      this.resizes++;
    }
    stop() {
      this.isStopped = true;
    }
    start() {
      this.isStopped = false;
    }
    destroy() {
      this.destroyed = true;
    }
    scrollTo(value) {
      this.destination = value;
    }
  }
  window.Lenis = missingLenis ? undefined : Lenis;
  if (missing) window.gsap = undefined;
  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      observers.push({ target, callback: this.callback });
    }
  }
  class ResizeObserver {
    constructor(callback) {
      resizeObservers.push(callback);
    }
    observe() {}
  }
  vm.runInNewContext(source, { window, document, MutationObserver, ResizeObserver });
  return {
    window,
    document,
    mediaQuery,
    element,
    group,
    items,
    mediaElement,
    instances,
    callbacks,
    tweens,
    setLock(value) {
      body.locked = value;
      observers.find(({ target }) => target === body).callback();
    },
    setReduced(value) {
      mediaQuery.matches = value;
      mediaQuery.emit("change");
      runMedia?.();
    },
    rerunMedia: () => runMedia(),
    resizeLayout: () => resizeObservers.forEach((callback) => callback()),
    resizeWindow() {
      window.emit("resize");
      resizeTimer?.();
    },
    tick: (time = 1) => [...callbacks].forEach((callback) => callback(time)),
    flushFrames() {
      for (const callback of frames.values()) callback();
      frames.clear();
      return refreshes;
    },
  };
}

test("one GSAP ticker drives Lenis, locking stops inertia and unlocking resynchronizes", () => {
  const env = setup();
  const lenis = env.instances[0];
  assert.equal(lenis.options.autoRaf, false);
  assert.equal(lenis.options.syncTouch, false);
  assert.equal(lenis.options.lerp, 0.1);
  assert.equal(env.callbacks.size, 1);
  [...env.callbacks][0](2);
  assert.equal(lenis.time, 2000);
  env.setLock(true);
  assert.equal(lenis.isStopped, true);
  env.setLock(false);
  assert.equal(lenis.isStopped, false);
  assert.ok(lenis.resizes > 0);
  env.window.emit("pagehide");
  assert.equal(env.callbacks.size, 0);
  env.window.emit("pageshow");
  env.window.emit("pageshow");
  assert.equal(env.callbacks.size, 1);
  assert.equal(env.window.scrollY, 100, "restored scroll position is preserved");
});

test("reduced motion destroys Lenis and restores native immediate positioning", () => {
  const env = setup();
  const previous = env.instances[0];
  env.setReduced(true);
  assert.equal(previous.destroyed, true);
  assert.equal(env.callbacks.size, 0);
  env.window.SITE_SCROLL.scrollTo(env.element, { block: "center" });
  assert.equal(env.element.nativeScroll.behavior, "instant");
  assert.equal(env.element.nativeScroll.block, "center");
  env.setReduced(false);
  assert.equal(env.instances.length, 2);
  assert.equal(env.callbacks.size, 1);
  assert.equal(env.tweens.length, 4, "visible content is not hidden again after reduced motion");
});

test("missing libraries leave content visible and keep the scroll interface usable", () => {
  for (const options of [{ missing: true }, { reduced: true }, { missingLenis: true }]) {
    const env = setup(options);
    assert.equal(env.instances.length, 0);
    env.window.SITE_SCROLL.scrollTo(env.element);
    assert.equal(env.element.nativeScroll.behavior, options.reduced ? "instant" : "smooth");
    if (!options.missingLenis) assert.equal(env.tweens.length, 0);
  }
});

test("center positioning uses actual page coordinates and nested locks use native positioning", () => {
  const env = setup();
  env.window.SITE_SCROLL.scrollTo(env.element, { block: "center" });
  assert.equal(env.instances[0].destination, 200);
  env.setLock(true);
  env.window.SITE_SCROLL.scrollTo(env.element);
  assert.equal(env.element.nativeScroll.behavior, "instant");
});

test("layout refresh is coalesced and native keyboard scrolling cancels inertia", () => {
  const env = setup();
  env.window.emit("load");
  env.resizeLayout();
  env.resizeWindow();
  assert.equal(env.flushFrames(), 1);
  assert.equal(
    env.window.ScrollTrigger.options.autoRefreshEvents,
    "visibilitychange,DOMContentLoaded",
    "load and resize refreshes are scheduled by motion.js, not ScrollTrigger itself"
  );
  const lenis = env.instances[0];
  let stops = 0;
  lenis.stop = () => stops++;
  env.document.emit("keydown", { key: "PageDown", target: { closest: () => null } });
  env.document.emit("keydown", { key: "ArrowDown", target: { closest: () => ({}) } });
  assert.equal(stops, 1, "editing a field must not cancel or hijack its arrow keys");
});

test("entrances follow the reference timing: staggered text and delayed media", () => {
  const env = setup();
  const byTarget = (target) => env.tweens.find((tween) => tween.target === target);
  const delays = env.items.map((item) => byTarget(item).to.delay);
  assert.deepEqual(delays, [0.1, 0.3, 0.5]);
  for (const item of env.items) {
    const { from, to } = byTarget(item);
    assert.equal(from.y, 40);
    assert.equal(from.rotation, 2);
    assert.equal(to.duration, 0.5);
    assert.equal(to.scrollTrigger.trigger, env.group, "items start together with their group");
  }
  const media = byTarget(env.mediaElement);
  assert.equal(media.from.y, 20);
  assert.equal(media.to.duration, 0.8);
  assert.equal(media.to.delay, 0.3);
  assert.equal(media.to.scrollTrigger.start, "top bottom");
  assert.equal(media.to.scrollTrigger.once, true);
  assert.equal(media.to.clearProps, "opacity,transform", "hover styles work after playing");
});

test("completed or reduced-motion entrances are never hidden again", () => {
  const env = setup();
  const count = env.tweens.length;
  for (const tween of env.tweens) tween.to.onComplete();
  env.rerunMedia();
  assert.equal(env.tweens.length, count);
  const reduced = setup({ reduced: true });
  assert.equal(reduced.tweens.length, 0);
});

test("refresh waits until Lenis stops so scrolling never snaps back", () => {
  const env = setup();
  const before = env.flushFrames();
  const lenis = env.instances[0];
  lenis.isScrolling = "smooth";
  env.resizeLayout();
  env.window.emit("load");
  assert.equal(env.flushFrames(), before, "no ScrollTrigger.refresh() while Lenis is moving");
  env.tick();
  assert.equal(env.flushFrames(), before, "still deferred while scrolling");
  lenis.isScrolling = false;
  env.tick();
  assert.equal(env.flushFrames(), before + 1, "the deferred refresh runs once scrolling stops");
  env.tick();
  assert.equal(env.flushFrames(), before + 1, "and only once");
});

test("a refresh queued just before scrolling starts is deferred as well", () => {
  const env = setup();
  const before = env.flushFrames();
  const lenis = env.instances[0];
  env.resizeLayout();
  lenis.isScrolling = "smooth";
  assert.equal(env.flushFrames(), before);
  lenis.isScrolling = false;
  env.tick();
  assert.equal(env.flushFrames(), before + 1);
});
