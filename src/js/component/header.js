// Header 互動：捲動縮合、行動版抽屜、子選單展開。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  const DESKTOP_QUERY = "(min-width: 64rem)";

  const setupScrollState = (header) => {
    let ticking = false;

    const sync = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 0);
      ticking = false;
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
