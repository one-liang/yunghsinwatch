// 首頁主視覺輪播。
// swiper-bundle 由頁面 HTML 在本檔之前以 <script> 載入，因此可直接取用全域 Swiper。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  const carousel = document.querySelector(".home-hero-swiper");
  if (!carousel || typeof window.Swiper !== "function") return;

  new window.Swiper(carousel, {
    loop: true,
    autoplay: {
      delay: 5000,
    },
    a11y: {
      enabled: false,
    },
    pagination: {
      el: ".home-hero-pagination",
      clickable: true,
    },
  });
})();
