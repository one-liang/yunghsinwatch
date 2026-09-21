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
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  const STORAGE_KEY = "site-lang";
  const DEFAULT_LANG = "zh";
  const HTML_LANG = { zh: "zh-Hant", en: "en" };

  const dictionaryFor = (lang) => window.SITE_I18N?.[lang] ?? null;

  const resolve = (lang) => (dictionaryFor(lang) ? lang : DEFAULT_LANG);

  const readStored = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const writeStored = (lang) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* 隱私模式或停用儲存時略過，不影響切換本身。 */
    }
  };

  const has = (dict, key) => Boolean(key) && Object.hasOwn(dict, key);

  const apply = (lang) => {
    const dict = dictionaryFor(lang) ?? {};

    document.documentElement.lang = HTML_LANG[lang] ?? HTML_LANG[DEFAULT_LANG];

    for (const el of document.querySelectorAll("[data-i18n]")) {
      const key = el.dataset.i18n;
      if (has(dict, key)) el.textContent = dict[key];
    }

    for (const el of document.querySelectorAll("[data-i18n-attr]")) {
      for (const pair of el.dataset.i18nAttr.split(",")) {
        const separator = pair.indexOf(":");
        if (separator < 0) continue;

        const attr = pair.slice(0, separator).trim();
        const key = pair.slice(separator + 1).trim();
        if (attr && has(dict, key)) el.setAttribute(attr, dict[key]);
      }
    }

    for (const el of document.querySelectorAll("[data-lang-switch]")) {
      const active = el.dataset.langSwitch === lang;
      el.setAttribute("data-active", active ? "true" : "false");
      el.setAttribute("aria-pressed", active ? "true" : "false");
    }
  };

  const setLang = (lang) => {
    const next = resolve(lang);
    writeStored(next);
    apply(next);
  };

  const init = () => {
    apply(resolve(readStored() ?? DEFAULT_LANG));

    document.addEventListener("click", (event) => {
      const { target } = event;
      if (!(target instanceof Element)) return;

      const trigger = target.closest("[data-lang-switch]");
      if (!trigger) return;

      event.preventDefault();
      setLang(trigger.dataset.langSwitch);
    });
  };

  window.setSiteLang = setLang;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
