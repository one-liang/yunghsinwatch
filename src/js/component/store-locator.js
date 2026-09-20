// 門市地圖區塊的互動：
//
// - 點列表中的門市 → 換掉 Google Maps embed 的 src，把地圖帶到該店。
// - LG 以下多一顆切換鈕，在「地圖」與「門市列表」之間切換（用容器的 data-view）。
// - 地圖語系跟著 <html lang> 走；i18n runtime 只改屬性、沒有發事件，
//   所以這裡用 MutationObserver 盯住 lang，切語系時重載地圖。
//
// 用 Maps embed（?output=embed）而非 Maps JavaScript API，因此不需要 API key，
// 代價是圖釘樣式固定、換店會整個 iframe 重載。
(function () {
  "use strict";

  var MOBILE_QUERY = "(max-width: 63.9375rem)";

  function embedUrl(query, lang) {
    return (
      "https://www.google.com/maps?q=" +
      encodeURIComponent(query) +
      "&hl=" +
      (lang === "en" ? "en" : "zh-TW") +
      "&z=17&output=embed"
    );
  }

  function currentLang() {
    return String(document.documentElement.lang || "")
      .toLowerCase()
      .indexOf("en") === 0
      ? "en"
      : "zh";
  }

  function setup(root) {
    var frame = root.querySelector("[data-store-map]");
    var items = Array.prototype.slice.call(root.querySelectorAll("[data-store-item]"));
    var switcher = root.querySelector("[data-store-switch]");

    if (!frame || !items.length) return;

    function active() {
      var found = items.filter(function (item) {
        return item.getAttribute("aria-current") === "true";
      });
      return found[0] || items[0];
    }

    function render() {
      var item = active();
      var lang = currentLang();
      var query =
        item.getAttribute("data-store-query-" + lang) || item.getAttribute("data-store-query-zh");
      if (!query) return;

      var next = embedUrl(query, lang);
      if (frame.getAttribute("src") !== next) frame.setAttribute("src", next);
    }

    function select(item) {
      items.forEach(function (other) {
        other.setAttribute("aria-current", other === item ? "true" : "false");
      });
      render();

      // 手機看的是單一視圖，選完門市就切回地圖，否則看不到剛選的位置。
      if (window.matchMedia(MOBILE_QUERY).matches) root.setAttribute("data-view", "map");
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        select(item);
      });
    });

    if (switcher) {
      switcher.addEventListener("click", function () {
        root.setAttribute("data-view", root.getAttribute("data-view") === "list" ? "map" : "list");
      });
    }

    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    render();
  }

  function init() {
    document.querySelectorAll("[data-store-locator]").forEach(setup);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
