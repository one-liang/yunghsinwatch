// 維修保養頁的 FAQ 手風琴。
//
// 狀態分別掛在兩個地方，各自對應 HTML 裡寫死的 Tailwind 變體：
//   - 按鈕的 aria-expanded：圖示的 ＋／✕ 切換（group-aria-expanded）
//   - 面板的 data-open：展開動畫（data-open:grid-rows-[1fr]）
//
// 展開動畫用 grid-template-rows 0fr → 1fr，高度交給瀏覽器算，不必在 JS 量 scrollHeight，
// 內容換語系（中英文段落數不同）後也不會算錯。收合時 visibility 會在動畫結束後才變成
// hidden，所以收合狀態下的內容不會被鍵盤或螢幕閱讀器讀到。
//
// 多個項目可以同時展開（設計稿 2XL 就是全部展開的狀態）。
(function () {
  "use strict";

  function toggle(trigger) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;

    var expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", expanded ? "false" : "true");

    if (expanded) panel.removeAttribute("data-open");
    else panel.setAttribute("data-open", "");
  }

  function init() {
    document.querySelectorAll("[data-accordion]").forEach(function (accordion) {
      accordion.addEventListener("click", function (event) {
        var target = event.target;
        if (!(target instanceof Element)) return;

        var trigger = target.closest("[data-accordion-trigger]");
        if (trigger && accordion.contains(trigger)) toggle(trigger);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
