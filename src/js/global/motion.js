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
    const revealEase = CustomEase.create("site-reveal", "0.25,0.1,0.25,1");

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

    const elements = [...document.querySelectorAll("[data-reveal]")];
    const completed = new WeakSet();
    const media = gsap.matchMedia();
    media.add(
      { all: "all", wide: "(min-width: 80rem)", reduced: "(prefers-reduced-motion: reduce)" },
      ({ conditions }) => {
        for (const element of elements) {
          if (conditions.reduced) completed.add(element);
          if (completed.has(element)) continue;

          const direction = conditions.wide ? element.dataset.reveal : "up";
          const delay = Number(element.dataset.revealDelay ?? 0);
          gsap.fromTo(
            element,
            {
              opacity: 0,
              x: direction === "left" ? 48 : direction === "right" ? -48 : 0,
              y: direction === "up" ? 48 : 0,
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 2,
              delay: Number.isFinite(delay) ? Math.max(0, delay) / 1000 : 0,
              ease: revealEase,
              onComplete: () => completed.add(element),
              scrollTrigger: {
                trigger: element,
                start: "top bottom-=120",
                once: true,
              },
            }
          );
        }
      }
    );

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
