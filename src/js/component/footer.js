// 全站右下角 gotop 鈕（修改清單 #45）：捲過一個視窗高度後顯示，點擊回到頁面頂端。
// 有 Lenis 時走 window.SITE_SCROLL（src/js/global/motion.js），維持一致的平滑捲動。
(() => {
  "use strict";

  const button = document.querySelector("[data-gotop]");
  if (!button) return;

  // 行動版選單、預約彈窗打開時 body 會加上 overflow-hidden（header.js），這時隱藏，
  // 避免 gotop 浮在選單上（修改清單 #45 一瓶回饋）。
  const update = () => {
    const locked = document.body.classList.contains("overflow-hidden");
    button.toggleAttribute("data-visible", !locked && window.scrollY > window.innerHeight);
  };

  new MutationObserver(update).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();

  button.addEventListener("click", () => {
    if (window.SITE_SCROLL) window.SITE_SCROLL.scrollTo(document.body);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
