// 滾動進場動畫的初始化（套件：AOS，vendor 在 src/assets/vendor/aos/）。
//
// 參數對齊 patekboutiquemiami.com（Elementor + 主題自訂 keyframes）：
// 位移 48px、duration 2s、easing ease、只播一次。48px 的位移覆寫寫在
// src/styles/tailwind.css（AOS 預設是 100px）。各區塊的 delay 用 HTML 上的
// data-aos-delay 指定：team 頁整張卡 200ms、about 頁圖片 250ms。
//
// 這支放在 src/js/global/，builder 會注入每一頁，但 AOS 本體的 <script> 只寫在真的
// 有動畫的頁面，所以先確認 window.AOS 存在才初始化。載入順序是安全的：
// injectPageAssets 把 bundle 插在 </body> 前、也就是頁面自己那支 aos.js 之後。
//
// 注意 AOS 的 duration/delay 都是靠 CSS 屬性選擇器實作，只吃 50 的倍數。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  const init = () => {
    window.AOS?.init({
      duration: 2000,
      easing: "ease",
      once: true,
      offset: 120,
      // 使用者在系統層開了「減少動態效果」就整個停用；AOS 會把 data-aos* 屬性移除，
      // 內容直接呈現最終狀態，不會停在透明。
      disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
