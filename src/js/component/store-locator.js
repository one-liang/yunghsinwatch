// 門市地圖區塊的互動：
//
// - 點列表中的門市 → 換掉 Google Maps embed 的 src，把地圖帶到該店。
// - LG 以下多一顆切換鈕，在「地圖」與「門市列表」之間切換（用容器的 data-view）。
// - 地圖語系跟著 <html lang> 走；i18n runtime 只改屬性、沒有發事件，
//   所以這裡用 MutationObserver 盯住 lang，切語系時重載地圖。
//
// 用 Maps embed（?output=embed）而非 Maps JavaScript API，因此不需要 API key，
// 代價是圖釘樣式固定、換店會整個 iframe 重載。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  const MOBILE_QUERY = "(max-width: 63.9375rem)";

  const embedUrl = (query, lang) =>
    `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=${
      lang === "en" ? "en" : "zh-TW"
    }&z=17&output=embed`;

  const currentLang = () =>
    String(document.documentElement.lang ?? "")
      .toLowerCase()
      .startsWith("en")
      ? "en"
      : "zh";

  const setup = (root) => {
    const frame = root.querySelector("[data-store-map]");
    const items = [...root.querySelectorAll("[data-store-item]")];
    const switcher = root.querySelector("[data-store-switch]");

    if (!frame || !items.length) return;

    const active = () =>
      items.find((item) => item.getAttribute("aria-current") === "true") ?? items[0];

    const render = () => {
      const item = active();
      const lang = currentLang();
      const query =
        item.dataset[`storeQuery${lang === "en" ? "En" : "Zh"}`] ?? item.dataset.storeQueryZh;
      if (!query) return;

      const next = embedUrl(query, lang);
      if (frame.getAttribute("src") !== next) frame.setAttribute("src", next);
    };

    const select = (item) => {
      for (const other of items) {
        other.setAttribute("aria-current", other === item ? "true" : "false");
      }
      render();

      // 手機看的是單一視圖，選完門市就切回地圖，否則看不到剛選的位置。
      if (window.matchMedia(MOBILE_QUERY).matches) root.dataset.view = "map";
    };

    for (const item of items) {
      item.addEventListener("click", () => select(item));
    }

    switcher?.addEventListener("click", () => {
      root.dataset.view = root.dataset.view === "list" ? "map" : "list";
    });

    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    render();
  };

  const init = () => {
    for (const root of document.querySelectorAll("[data-store-locator]")) setup(root);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
