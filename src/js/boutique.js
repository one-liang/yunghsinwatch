// 專賣店介紹頁的圖片輪播。
// swiper-bundle 由頁面 HTML 在本檔之前以 <script> 載入，因此可直接取用全域 Swiper。
//
// slide 寬度寫在 boutique.css 的 --slide-w（各斷點不同），所以這裡用
// slidesPerView: "auto" 讓 Swiper 讀實際寬度，只在 JS 控制 slide 之間的間距。
// 刻意不開 loop：設計上到頭／尾時箭頭要停用，與 Patek 官網的行為一致。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  const carousel = document.querySelector(".boutique-carousel__viewport");
  if (!carousel || typeof window.Swiper !== "function") return;

  new window.Swiper(carousel, {
    slidesPerView: "auto",
    centeredSlides: true,
    spaceBetween: 20,
    navigation: {
      prevEl: "[data-carousel-prev]",
      nextEl: "[data-carousel-next]",
    },
    breakpoints: {
      1024: {
        spaceBetween: 48,
      },
    },
  });
})();
