// 全站平滑捲動與進場動畫。套件由 c-motion-scripts 以本機普通 script 載入。
// builder 串接非 module JS，所以使用 IIFE 避免全域名稱衝突。
(() => {
  "use strict";

  const init = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const { gsap, ScrollTrigger, CustomEase, Lenis } = window;
    let lenis = null;
    let paused = false;
    let refreshFrame = null;

    const isLocked = () => document.body.classList.contains("overflow-hidden");

    // 即使套件未載入，頁面腳本仍能使用相同介面，內容也不依賴 JS 才能顯示。
    window.SITE_SCROLL = {
      scrollTo(element, { block = "start" } = {}) {
        if (!element) return;
        if (!lenis || isLocked()) {
          element.scrollIntoView({
            block,
            behavior: reducedMotion.matches || isLocked() ? "instant" : "smooth",
          });
          return;
        }

        lenis.resize();
        const rect = element.getBoundingClientRect();
        const offset = block === "center" ? (window.innerHeight - rect.height) / 2 : 0;
        lenis.scrollTo(window.scrollY + rect.top - offset);
      },
    };

    if (!gsap || !ScrollTrigger || !CustomEase) return;
    gsap.registerPlugin(ScrollTrigger, CustomEase);

    const tick = (time) => lenis?.raf(time * 1000);
    gsap.ticker.lagSmoothing(0);

    const syncLock = () => {
      if (!lenis) return;
      if (paused || isLocked()) lenis.stop();
      else if (lenis.isStopped) {
        lenis.resize();
        lenis.start();
      }
    };

    const syncSmoothScroll = () => {
      if (reducedMotion.matches || !Lenis) {
        gsap.ticker.remove(tick);
        lenis?.destroy();
        lenis = null;
        return;
      }

      if (!lenis) {
        lenis = new Lenis({
          autoRaf: false,
          smoothWheel: true,
          lerp: 0.1,
          wheelMultiplier: 1,
          syncTouch: false,
          anchors: true,
          prevent: (node) => node.hasAttribute("data-lenis-prevent"),
        });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
      }
      syncLock();
    };

    syncSmoothScroll();
    reducedMotion.addEventListener("change", syncSmoothScroll);
    new MutationObserver(syncLock).observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const completed = new WeakSet();

    // 全站捲動進場，參考 furlanmarri.com（Figma Mockup comment #3、#4、#6、#11、#12、#13），
    // 元素一進入視窗就播放一次：
    // - [data-reveal-group]：群組內的 [data-reveal-item] 依序往上 2.5rem、帶 2° 旋轉淡入，0.5s
    // - [data-reveal-media]：往上 1.25rem 淡入，0.8s、延遲 0.3s
    const entranceEase = CustomEase.create("site-entrance", "0.25,0.46,0.45,0.94");
    const GROUP_DELAYS = [0.1, 0.3, 0.5, 0.8];
    const groups = [...document.querySelectorAll("[data-reveal-group]")].map((group) => ({
      trigger: group,
      items: [...group.querySelectorAll("[data-reveal-item]")],
    }));
    const mediaItems = [...document.querySelectorAll("[data-reveal-media]")];
    // 超出參考站四段延遲的項目，沿用最後的 0.3s 間隔往後排。
    const groupDelay = (index) =>
      GROUP_DELAYS[index] ?? GROUP_DELAYS.at(-1) + (index - GROUP_DELAYS.length + 1) * 0.3;

    const media = gsap.matchMedia();
    media.add({ all: "all", reduced: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
      const entrance = (target, trigger, from, to) => {
        if (conditions.reduced) completed.add(target);
        if (completed.has(target)) return;

        gsap.fromTo(target, from, {
          ...to,
          ease: entranceEase,
          // 播完移除行內 opacity／transform，讓元素本身的 hover 樣式（例如預約按鈕）繼續生效。
          clearProps: "opacity,transform",
          onComplete: () => completed.add(target),
          scrollTrigger: { trigger, start: "top bottom", once: true },
        });
      };

      for (const { trigger, items } of groups) {
        items.forEach((item, index) =>
          entrance(
            item,
            trigger,
            { opacity: 0, y: 40, rotation: 2 },
            { opacity: 1, y: 0, rotation: 0, duration: 0.5, delay: groupDelay(index) }
          )
        );
      }

      for (const element of mediaItems) {
        entrance(
          element,
          element,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.3 }
        );
      }
    });

    const refresh = () => {
      if (refreshFrame !== null || paused) return;
      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = null;
        lenis?.resize();
        ScrollTrigger.refresh();
      });
    };

    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    document.addEventListener("load", refresh, true);
    new MutationObserver(refresh).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    // 鍵盤或聚焦的原生定位要先取消尚未完成的滾輪慣性。
    const cancelInertia = () => {
      if (!lenis || paused || isLocked()) return;
      lenis.stop();
      lenis.start();
    };
    document.addEventListener("focusin", cancelInertia);
    document.addEventListener("keydown", ({ key, target }) => {
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(key)) {
        cancelInertia();
      }
    });

    // 保留瀏覽器的上一頁位置還原；BFCache 返回時只同步，不主動捲回頁首。
    window.addEventListener("pagehide", () => {
      paused = true;
      if (refreshFrame !== null) window.cancelAnimationFrame(refreshFrame);
      refreshFrame = null;
      gsap.ticker.remove(tick);
      lenis?.stop();
    });
    window.addEventListener("pageshow", () => {
      paused = false;
      gsap.ticker.remove(tick);
      if (lenis) gsap.ticker.add(tick);
      syncLock();
      refresh();
    });
    refresh();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
