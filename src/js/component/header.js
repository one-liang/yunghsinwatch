// Header 互動：捲動縮合、行動版抽屜、子選單展開。
// builder 是純 concat 注入（非 module），因此包成 IIFE 避免污染全域。
(function () {
  "use strict";

  var DESKTOP_QUERY = "(min-width: 64rem)";

  function setupScrollState(header) {
    var ticking = false;

    function sync() {
      header.classList.toggle("is-scrolled", window.scrollY > 0);
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sync);
    }

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function setupDrawer(header) {
    var drawer = header.querySelector("[data-header-drawer]");
    var openButton = header.querySelector("[data-drawer-open]");
    if (!drawer || !openButton) return;

    function setOpen(open) {
      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      openButton.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("overflow-hidden", open);
      if (!open) openButton.focus({ preventScroll: true });
    }

    openButton.addEventListener("click", function () {
      setOpen(true);
    });

    drawer.querySelectorAll("[data-drawer-close]").forEach(function (button) {
      button.addEventListener("click", function () {
        setOpen(false);
      });
    });

    // 點抽屜內的連結後直接關閉，避免回到頁面時遮罩還蓋著。
    drawer.querySelectorAll("a[href]").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) setOpen(false);
    });

    // 視窗放大到桌機斷點時抽屜已經被隱藏，狀態也要一起還原。
    var desktop = window.matchMedia(DESKTOP_QUERY);
    var onChange = function (event) {
      if (event.matches) {
        drawer.classList.remove("is-open");
        drawer.setAttribute("aria-hidden", "true");
        openButton.setAttribute("aria-expanded", "false");
        document.body.classList.remove("overflow-hidden");
      }
    };

    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", onChange);
    } else {
      desktop.addListener(onChange);
    }
  }

  function setupAccordion(header) {
    header.querySelectorAll("[data-accordion]").forEach(function (accordion) {
      var toggle = accordion.querySelector("[data-accordion-toggle]");
      if (!toggle) return;

      toggle.addEventListener("click", function () {
        var open = accordion.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  // 桌機下拉：hover 由 CSS 的 :hover / :focus-within 處理，
  // 這裡只補上滑鼠點擊與觸控裝置需要的顯性開關。
  function setupDropdown(header) {
    var dropdowns = [];

    header.querySelectorAll("[data-dropdown-toggle]").forEach(function (toggle) {
      var dropdown = toggle.closest(".site-header__dropdown");
      if (!dropdown) return;

      dropdowns.push(dropdown);

      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        var open = !dropdown.classList.contains("is-open");
        closeAll();
        dropdown.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    function closeAll() {
      dropdowns.forEach(function (dropdown) {
        dropdown.classList.remove("is-open");
        var toggle = dropdown.querySelector("[data-dropdown-toggle]");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    }

    if (!dropdowns.length) return;

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (target instanceof Element && target.closest(".site-header__dropdown")) return;
      closeAll();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeAll();
    });
  }

  function init() {
    var header = document.querySelector("[data-site-header]");
    if (!header) return;

    setupScrollState(header);
    setupDrawer(header);
    setupAccordion(header);
    setupDropdown(header);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
