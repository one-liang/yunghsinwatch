// 圖片展示輪播：縮圖列透過 Swiper 的 thumbs 模組控制主圖。
// swiper-bundle 由頁面 HTML 在本檔之前以 <script> 載入，因此可直接取用全域 Swiper。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  if (typeof window.Swiper !== "function") return;

  const thumbs = new window.Swiper(".model-gallery__thumbs", {
    slidesPerView: 4,
    spaceBetween: 16,
    watchSlidesProgress: true,
  });

  new window.Swiper(".model-gallery__main", {
    slidesPerView: 1,
    thumbs: { swiper: thumbs },
  });
})();
