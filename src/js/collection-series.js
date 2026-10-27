// 單系列列表頁「繼續探索」輪播（修改清單 #47）。
// swiper-bundle 由頁面 HTML 在本檔之前以 <script> 載入，因此可直接取用全域 Swiper。
// 每頁張數與間距依 Figma Series Page：640～1023px 2 個、間距 48px（1287:9299）；LG 3 個、48px；XL 起 3 個、64px。
// 640px 以下設計稿沒有新版，2 個時卡片只剩約 144px，24px 的系列名稱（Complications）會被截掉，所以改為 1 個。
// 不開 loop，到頭／尾時箭頭淡出（樣式在 collection-series.css），行為比照精品店輪播。
(() => {
  "use strict";

  const carousel = document.querySelector(".series-discover__viewport");
  if (!carousel || typeof window.Swiper !== "function") return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  new window.Swiper(carousel, {
    speed: reducedMotion ? 0 : 600,
    slidesPerView: 1,
    spaceBetween: 48,
    navigation: {
      prevEl: "[data-discover-prev]",
      nextEl: "[data-discover-next]",
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
      1280: {
        slidesPerView: 3,
        spaceBetween: 64,
      },
    },
  });
})();
