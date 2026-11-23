// 首頁主視覺輪播，以及官方影片播放器的比例修正。
// swiper-bundle 由頁面 HTML 在本檔之前以 <script> 載入，因此可直接取用全域 Swiper。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  // 百達翡麗官方影片（#PPiframe，script.js 以 open shadow root 產生播放器）。
  // banner 模式的投影片是 padding-top: 40.1042%（約 2.49:1），輪播最寬 112.208vh，16:9 影片以 contain
  // 放在裡面，左右與下方都是空白（Mockup comment #29 回報的黑屏）。設計稿是 16:9（1200×675），
  // 所以投影片一律改成 16:9、拿掉最寬限制，影片剛好填滿。
  // 播放器的 class 是 styled-components 產生的雜湊值，會隨官方更新改變，所以用 aria-label 與結構選取；
  // 官方結構若改了，選擇器失效也只是回到官方原本的版面（外層已不再是黑底）。
  const PP_VIDEO_STYLE = `
    [aria-label="banner carousel"] { max-width: none !important; }
    [aria-label="banner carousel"] section > section { padding-top: 56.25% !important; }
  `;

  // 500px 以下官方改用 9:16 直式影片（Mobile_9x16/<名稱>_9x16.mp4），放進 16:9 會縮成中間一條。
  // 手機版依 Figma SM 也是 16:9，所以換成同名的橫式檔（Desktop_16x9/<名稱>_16x9.mp4）。
  // 播放器在視窗跨過 500px 時會重新給 src，所以用 MutationObserver 持續換回橫式。
  const MOBILE_VIDEO = /\/Mobile_9x16\/(.+)_9x16\.mp4$/;

  // 換 src 後要 load() 才會生效，load() 會停止播放；畫面上這一張（水平中心落在播放器內）接著播。
  const isShown = (video, host) => {
    const box = host.getBoundingClientRect();
    const rect = video.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    return rect.width > 0 && center > box.left && center < box.right;
  };

  const useLandscapeVideos = (root, host) => {
    for (const source of root.querySelectorAll("video source[src]")) {
      const src = source.getAttribute("src");
      if (!MOBILE_VIDEO.test(src)) continue;
      const video = source.parentElement;
      source.setAttribute("src", src.replace(MOBILE_VIDEO, "/Desktop_16x9/$1_16x9.mp4"));
      video.load();
      if (isShown(video, host)) video.play().catch(() => {});
    }
  };

  const fitPatekVideo = () => {
    const host = document.getElementById("PPiframe");
    if (!host) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      const root = host.shadowRoot;
      tries += 1;
      if (root) {
        const style = document.createElement("style");
        style.textContent = PP_VIDEO_STYLE;
        root.append(style);
        useLandscapeVideos(root, host);
        new MutationObserver(() => useLandscapeVideos(root, host)).observe(root, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["src"],
        });
      }
      // script.js 為 async 載入，最多等 30 秒。
      if (root || tries >= 120) window.clearInterval(timer);
    }, 250);
  };

  fitPatekVideo();

  const carousel = document.querySelector(".home-hero-swiper");
  if (!carousel || typeof window.Swiper !== "function") return;

  new window.Swiper(carousel, {
    loop: true,
    // Mockup comment #41：輪播速度 2 秒。
    autoplay: {
      delay: 2000,
    },
    a11y: {
      enabled: false,
    },
    pagination: {
      el: ".home-hero-pagination",
      clickable: true,
    },
  });
})();
