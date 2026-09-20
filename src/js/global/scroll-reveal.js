// 滾動進場動畫（向上淡入），效果對齊 patekboutiquemiami.com/our-team：
// 區塊捲進視窗時由下往上浮現，只播一次，回捲不重來。
//
// 沒有用 AOS 之類的套件 —— 全站只需要這一種效果，自己寫不到 40 行、零相依，
// 也省下再 vendor 一份 css/js 的維護成本。加在 src/js/global/ 底下，builder
// 會自動注入每一頁，其他頁面要用只要在元素掛 data-reveal-item 就好。
//
// 兩個刻意的防呆：
// 1. 隱藏樣式綁在 html[data-reveal-ready]（見 src/styles/tailwind.css），
//    而這個屬性只有這支 JS 跑起來才會掛上。JS 掛掉或被擋時內容照常顯示，
//    不會變成一片空白。
// 2. 使用者在系統層開了「減少動態效果」就整個跳過，連屬性都不掛，
//    直接呈現最終狀態。
(function () {
  "use strict";

  var SELECTOR = "[data-reveal-item]";

  function init() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    var items = document.querySelectorAll(SELECTOR);
    if (!items.length) return;

    document.documentElement.setAttribute("data-reveal-ready", "");

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          entry.target.setAttribute("data-reveal-visible", "");
          observer.unobserve(entry.target);
        });
      },
      // 抓底部 10%，讓元素稍微進來一點才觸發，避免貼著視窗邊緣就播完。
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
