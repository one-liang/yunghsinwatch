// 極簡 i18n runtime（沒有用任何套件，就是把 data-i18n 的文字換掉）。
//
// - 字典由 i18n-zh.js / i18n-en.js 掛在 window.SITE_I18N 上，載入順序不拘，
//   因為這支只在 DOM ready 之後才讀字典。
// - 文字節點用 data-i18n="<key>"；屬性用 data-i18n-attr="aria-label:<key>"（可逗號分隔多組）。
// - 選中的語系寫進 localStorage，並同步 <html lang>，讓 tailwind.css 的 `en:` variant 生效。
//
// 已知取捨：builder 只在 </body> 前注入一支 script，所以上次選英文的訪客
// 重新整理時會有一瞬間看到 HTML 原始的中文。要消除就得讓 builder 支援 <head> 內的
// inline script，目前不值得為此改架構。
(function () {
  "use strict";

  var STORAGE_KEY = "site-lang";
  var DEFAULT_LANG = "zh";
  var HTML_LANG = { zh: "zh-Hant", en: "en" };

  function dictionaryFor(lang) {
    var all = window.SITE_I18N || {};
    return all[lang] || null;
  }

  function resolve(lang) {
    return dictionaryFor(lang) ? lang : DEFAULT_LANG;
  }

  function readStored() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function writeStored(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      /* 隱私模式或停用儲存時略過，不影響切換本身。 */
    }
  }

  function has(dict, key) {
    return key && Object.prototype.hasOwnProperty.call(dict, key);
  }

  function apply(lang) {
    var dict = dictionaryFor(lang) || {};

    document.documentElement.lang = HTML_LANG[lang] || HTML_LANG[DEFAULT_LANG];

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (has(dict, key)) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr")
        .split(",")
        .forEach(function (pair) {
          var separator = pair.indexOf(":");
          if (separator < 0) return;

          var attr = pair.slice(0, separator).trim();
          var key = pair.slice(separator + 1).trim();
          if (attr && has(dict, key)) el.setAttribute(attr, dict[key]);
        });
    });

    document.querySelectorAll("[data-lang-switch]").forEach(function (el) {
      var active = el.getAttribute("data-lang-switch") === lang;
      el.setAttribute("data-active", active ? "true" : "false");
      el.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function setLang(lang) {
    var next = resolve(lang);
    writeStored(next);
    apply(next);
  }

  function init() {
    apply(resolve(readStored() || DEFAULT_LANG));

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;

      var trigger = target.closest("[data-lang-switch]");
      if (!trigger) return;

      event.preventDefault();
      setLang(trigger.getAttribute("data-lang-switch"));
    });
  }

  window.setSiteLang = setLang;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
