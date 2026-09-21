// Header 互動：捲動縮合、行動版抽屜、子選單展開。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  const DESKTOP_QUERY = "(min-width: 64rem)";

  // 收縮會讓 header 佔位從 172px 變 88px，後面的內容整體上移 84px。門檻若設在 0，
  // 使用者只捲 1px 畫面卻位移 84px，體感就是頓一下；所以門檻要大於收縮量，
  // 並用上下兩個值做遲滯，避免在門檻邊界反覆切換。
  const SHRINK_AT = 160;
  const EXPAND_AT = 80;

  // header.css 的 --header-shrink-duration 是動畫時間的單一事實來源，這裡讀回來，
  // nav 的補間才會跟 CSS 的 height/max-width 過渡同步。
  const readShrinkDuration = (header) => {
    const raw = getComputedStyle(header).getPropertyValue("--header-shrink-duration").trim();
    if (!raw) return 0;

    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return 0;

    return raw.endsWith("ms") ? value : value * 1000;
  };

  const setupScrollState = (header) => {
    const nav = header.querySelector(".site-header__nav");
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let scrolled = null; // null 代表尚未初始化
    let ticking = false;
    let navAnimation = null;

    // nav 在收縮前後是 absolute ↔ static：從 header 底部的整行，變成 bar 裡 brand 與
    // actions 之間的一欄，位移約 (85, 94)px。position 無法過渡，所以用 FLIP 補間——
    // 先記舊位置，套上 class 讓版面到位，再用 transform 把 nav 拉回舊位置滑過去。
    // transform 走合成器，不會增加重排成本；nav 內沒有 fixed 子元素，submenu 是以
    // .site-header__dropdown 為定位基準，不受這個 transform 影響。
    const applyWithNavFlip = (next) => {
      const duration = readShrinkDuration(header);
      const animatable = nav && desktop.matches && !reducedMotion.matches && duration > 0;

      if (!animatable) {
        header.classList.toggle("is-scrolled", next);
        return;
      }

      navAnimation?.cancel();

      const first = nav.getBoundingClientRect();
      header.classList.toggle("is-scrolled", next);
      const last = nav.getBoundingClientRect();

      // 用中心點而非左上角：nav 兩個狀態的寬度差很多（整行 vs 內容寬），
      // 但 ul 都是置中的，所以對齊中心才不會有橫向抽動。
      const dx = first.left + first.width / 2 - (last.left + last.width / 2);
      const dy = first.top + first.height / 2 - (last.top + last.height / 2);
      if (!dx && !dy) return;

      navAnimation = nav.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
        { duration, easing: "ease" }
      );
    };

    const sync = () => {
      ticking = false;

      const y = window.scrollY;
      // 80~160 之間維持現狀
      const next = scrolled === true ? y >= EXPAND_AT : y > SHRINK_AT;
      if (next === scrolled) return;

      // 首次初始化時直接定裝，不播動畫（例如重新整理時就停在頁面中段）。
      const animate = scrolled !== null;
      scrolled = next;

      if (animate) applyWithNavFlip(next);
      else header.classList.toggle("is-scrolled", next);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
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
