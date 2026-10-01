// Header 互動：捲動縮合、行動版抽屜、子選單展開。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  const DESKTOP_QUERY = "(min-width: 64rem)";

  // 上下兩個門檻避免 Lenis 慣性尾端在邊界反覆切換。
  const SHRINK_AT = 160;
  const EXPAND_AT = 80;
  const TRANSITION_DURATION = 1;

  const setupScrollState = (header) => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const { gsap, CustomEase } = window;
    const background = header.querySelector(".site-header__background");
    const brandText = header.querySelector(".site-header__brand-text");
    const logo = header.querySelector(".site-header__logo");
    const nav = header.querySelector(".site-header__nav > ul");
    const parts = [logo, nav, header.querySelector(".site-header__actions")].filter(Boolean);
    const targets = [...parts, background, brandText].filter(Boolean);
    let scrolled = null;
    let ticking = false;
    let timeline = null;
    let transition = null;
    const ease = gsap && CustomEase ? CustomEase.create("site-header", "0.25,0.1,0.25,1") : null;

    // 只在初始化／尺寸與語言改變時量測兩個靜態端點。
    // 回到 expanded 布局後，所有幀只寫 transform / opacity；不再改整頁高度。
    const rebuild = () => {
      transition?.kill();
      transition = null;
      timeline?.kill();
      timeline = null;
      gsap?.set(targets, { clearProps: "transform,opacity,visibility" });
      header.classList.remove("has-header-motion", "is-measuring-compact");
      if (!desktop.matches || !ease || reducedMotion.matches) return;

      header.classList.add("has-header-motion");
      const first = parts.map((part) => part.getBoundingClientRect());
      const brandBottom = brandText.getBoundingClientRect().bottom;
      header.classList.add("is-measuring-compact");
      const last = parts.map((part) => part.getBoundingClientRect());
      header.classList.remove("is-measuring-compact");

      // 元素補間保持線性，easing 交給控制時間的 tween，兩個方向才有相同起步速度。
      timeline = gsap.timeline({
        paused: true,
        defaults: { duration: TRANSITION_DURATION, ease: "none" },
      });
      parts.forEach((part, index) => {
        const start = first[index];
        const end = last[index];
        timeline.to(
          part,
          {
            force3D: true,
            x: end.left + end.width / 2 - (start.left + start.width / 2),
            y: end.top + end.height / 2 - (start.top + start.height / 2),
            ...(part === logo
              ? { scaleX: end.width / start.width, scaleY: end.height / start.height }
              : {}),
          },
          0
        );
      });
      timeline.to(background, { scaleY: 88 / 172, force3D: true }, 0);
      // 收合先淡出品牌；展開則等 nav 移到文字下方才淡入，避免兩者交疊閃動。
      const navIndex = parts.indexOf(nav);
      const navTravel = first[navIndex].top - last[navIndex].top;
      // 中英文文字高度不同，以實際底緣加 8px 間距決定安全淡入區段。
      const brandFadePortion = Math.max(
        0.05,
        Math.min(0.4, (first[navIndex].top - brandBottom - 8) / Math.max(1, navTravel))
      );
      timeline.to(
        brandText,
        {
          autoAlpha: 0,
          x: -16,
          force3D: true,
          duration: TRANSITION_DURATION * brandFadePortion,
        },
        0
      );
      timeline.progress(scrolled ? 1 : 0).pause();
    };

    const sync = () => {
      ticking = false;

      const y = window.scrollY;
      const next = scrolled === true ? y >= EXPAND_AT : y > SHRINK_AT;
      if (next === scrolled) return;

      const animate = scrolled !== null;
      scrolled = next;
      header.classList.toggle("is-scrolled", next);
      if (!timeline) return;
      // 不直接 reverse ease-out（反播會變成慢起步的 ease-in）。
      // 兩個方向都從目前位置，用相同的時間與 easing 前往目標。
      if (!animate) timeline.progress(next ? 1 : 0).pause();
      else {
        transition?.kill();
        transition = timeline.tweenTo(next ? timeline.duration() : 0, {
          duration: TRANSITION_DURATION,
          ease,
        });
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    };

    sync();
    rebuild();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", rebuild);
    window.addEventListener("pageshow", () => {
      sync();
      rebuild();
    });
    desktop.addEventListener("change", rebuild);
    reducedMotion.addEventListener("change", rebuild);
    new MutationObserver(rebuild).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    document.fonts?.ready.then(rebuild);
    logo?.addEventListener("load", rebuild);
  };

  const setupDrawer = (header) => {
    const drawer = header.querySelector("[data-header-drawer]");
    const openButton = header.querySelector("[data-drawer-open]");
    if (!drawer || !openButton) return;

    const setOpen = (open) => {
      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      openButton.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("overflow-hidden", open);
      if (!open) openButton.focus({ preventScroll: true });
    };

    openButton.addEventListener("click", () => setOpen(true));

    for (const button of drawer.querySelectorAll("[data-drawer-close]")) {
      button.addEventListener("click", () => setOpen(false));
    }

    // 點抽屜內的連結後直接關閉，避免回到頁面時遮罩還蓋著。
    // 預約 CTA 不在此列：它是 <button data-booking-open>，抽屜的收合由 booking-modal.js
    // 自己處理，交給這裡會把彈窗剛上好的 body 捲動鎖一起拔掉。
    for (const link of drawer.querySelectorAll("a[href]")) {
      link.addEventListener("click", () => setOpen(false));
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) setOpen(false);
    });

    // 視窗放大到桌機斷點時抽屜已經被隱藏，狀態也要一起還原。
    const desktop = window.matchMedia(DESKTOP_QUERY);
    desktop.addEventListener("change", ({ matches }) => {
      if (!matches) return;

      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      openButton.setAttribute("aria-expanded", "false");
      document.body.classList.remove("overflow-hidden");
    });
  };

  const setupAccordion = (header) => {
    for (const accordion of header.querySelectorAll("[data-accordion]")) {
      const toggle = accordion.querySelector("[data-accordion-toggle]");
      if (!toggle) continue;

      toggle.addEventListener("click", () => {
        const open = accordion.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  };

  // 桌機下拉：hover 由 CSS 的 :hover / :focus-within 處理，
  // 這裡只補上滑鼠點擊與觸控裝置需要的顯性開關。
  const setupDropdown = (header) => {
    const dropdowns = [];

    const closeAll = () => {
      for (const dropdown of dropdowns) {
        dropdown.classList.remove("is-open");
        dropdown.querySelector("[data-dropdown-toggle]")?.setAttribute("aria-expanded", "false");
      }
    };

    for (const toggle of header.querySelectorAll("[data-dropdown-toggle]")) {
      const dropdown = toggle.closest(".site-header__dropdown");
      if (!dropdown) continue;

      dropdowns.push(dropdown);

      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        const open = !dropdown.classList.contains("is-open");
        closeAll();
        dropdown.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    if (!dropdowns.length) return;

    document.addEventListener("click", ({ target }) => {
      if (target instanceof Element && target.closest(".site-header__dropdown")) return;
      closeAll();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAll();
    });
  };

  const init = () => {
    const header = document.querySelector("[data-site-header]");
    if (!header) return;

    setupScrollState(header);
    setupDrawer(header);
    setupAccordion(header);
    setupDropdown(header);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
