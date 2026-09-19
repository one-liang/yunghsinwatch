// 圖片展示輪播：縮圖列透過 Swiper 的 thumbs 模組控制主圖。
// swiper-bundle 由頁面 HTML 在本檔之前以 <script> 載入，因此可直接取用全域 Swiper。
(function () {
  "use strict";

  if (typeof Swiper !== "function") return;

  var thumbs = new Swiper(".model-gallery__thumbs", {
    slidesPerView: 4,
    spaceBetween: 16,
    watchSlidesProgress: true,
  });

  new Swiper(".model-gallery__main", {
    slidesPerView: 1,
    thumbs: { swiper: thumbs },
  });
})();
