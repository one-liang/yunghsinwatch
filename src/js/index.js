(function () {
  "use strict";

  var carousel = document.querySelector(".home-hero-swiper");
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
