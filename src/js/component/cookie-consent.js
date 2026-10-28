// 同意 Cookies 彈跳視窗（修改清單 #42）：目前只切版，不記錄使用者的選擇。
// 每次載入頁面都會開啟；Footer「Cookie偏好」可再次開啟，按鈕、點遮罩或 Esc 關閉。
(() => {
  "use strict";

  const init = () => {
    const modal = document.querySelector("[data-cookie-consent]");
    if (!modal) return;

    let lastTrigger = null;

    const isOpen = () => modal.classList.contains("is-open");

    const open = (trigger) => {
      lastTrigger = trigger ?? null;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("overflow-hidden");
    };

    const close = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("overflow-hidden");
      lastTrigger?.focus({ preventScroll: true });
      lastTrigger = null;
    };

    document.addEventListener("click", (event) => {
      const { target } = event;
      if (!(target instanceof Element)) return;

      const trigger = target.closest("[data-cookie-open]");
      if (trigger) {
        event.preventDefault();
        open(trigger);
        return;
      }

      if (!isOpen()) return;
      if (target.closest("[data-cookie-close]")) {
        close();
        return;
      }

      // 點在面板以外的地方（遮罩或捲動層的留白）就關閉。
      if (!modal.contains(target) || target.closest(".cookie-consent__panel")) return;
      close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) close();
    });

    open();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
