// 全站右下角 gotop 鈕（修改清單 #45）：捲過一個視窗高度後顯示，點擊回到頁面頂端。
// 有 Lenis 時走 window.SITE_SCROLL（src/js/global/motion.js），維持一致的平滑捲動。
(() => {
  "use strict";

  const button = document.querySelector("[data-gotop]");
  if (!button) return;

  const update = () => {
    button.toggleAttribute("data-visible", window.scrollY > window.innerHeight);
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  button.addEventListener("click", () => {
    if (window.SITE_SCROLL) window.SITE_SCROLL.scrollTo(document.body);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
