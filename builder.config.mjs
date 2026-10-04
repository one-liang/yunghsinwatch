export default {
  pages: "src/pages/**/*.html",
  componentsDir: "src/components",
  pageJsDir: "src/js",
  globalJsDir: "src/js/global",
  componentJsDir: "src/js/component",
  assetsDir: "src/assets",
  outDir: "dist",
  componentTagPattern: "CPrefixSelfClosing",
  // 每個來源頁依語系各輸出一頁：zh → index.html、en → en/index.html。
  i18n: {
    dir: "src/i18n",
    defaultLocale: "zh",
    locales: {
      zh: { htmlLang: "zh-Hant", dir: "" },
      en: { htmlLang: "en", dir: "en" },
    },
  },
};
