// 單錶介紹頁圖片展示輪播（collection-model*.html 共用）：縮圖列透過 Swiper 的 thumbs 模組控制主圖。
// swiper-bundle 由頁面 HTML 在本檔之前以 <script> 載入，因此可直接取用全域 Swiper。
// 縮圖超過一排（4 張）時用左右箭頭捲動縮圖列（修改清單 #30）；不足一排時 Swiper 會鎖住箭頭，CSS 將其隱藏。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  if (typeof window.Swiper !== "function") return;
  if (!document.querySelector(".model-gallery__thumbs")) return;

  const thumbs = new window.Swiper(".model-gallery__thumbs", {
    slidesPerView: 4,
    spaceBetween: 16,
    watchSlidesProgress: true,
    navigation: {
      prevEl: ".model-gallery__nav--prev",
      nextEl: ".model-gallery__nav--next",
    },
  });

  new window.Swiper(".model-gallery__main", {
    slidesPerView: 1,
    thumbs: { swiper: thumbs },
  });
})();
