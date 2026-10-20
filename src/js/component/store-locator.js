// 門市地圖區塊的互動：
//
// - 點列表中的門市 → 換掉 Google Maps embed 的 src，把地圖帶到該店，
//   並把列表換成該店的店面資訊；按 × 回到列表（修改清單 #34）。預設打開永新的店面資訊。
// - 店面資訊的營業時間依台北時間算出「營業中／休息中」與下一個開關門時間，今天那一列加 data-today。
// - LG 以下多一顆切換鈕，在「地圖」與「門市列表」之間切換（用容器的 data-view）。
// - 地圖語系跟著 <html lang> 走（zh／en 版頁面由 build 分別產生，lang 是靜態值）。
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

    const list = root.querySelector("[data-store-list]");
    const details = [...root.querySelectorAll("[data-store-detail]")];
    const panel = root.querySelector("[data-store-panel]");

    // 開啟某店的店面資訊（id 為 null 時回到列表）。
    const showDetail = (id) => {
      let shown = null;
      for (const detail of details) {
        const match = detail.dataset.storeDetail === id;
        detail.hidden = !match;
        if (match) shown = detail;
      }
      if (list) list.hidden = Boolean(shown);
      if (shown) updateHours(shown);
      if (panel) panel.scrollTop = 0;
      return shown;
    };

    const select = (item) => {
      for (const other of items) {
        other.setAttribute("aria-current", other === item ? "true" : "false");
      }
      render();

      // 有店面資訊就換成店面資訊；手機也停在「門市列表」這一側，讓使用者先看到店家資料，
      // 要看位置再按切換鈕回地圖。
      const shown = showDetail(item.dataset.storeId ?? null);
      if (shown) {
        shown.querySelector("[data-store-close]")?.focus({ preventScroll: true });
      } else if (window.matchMedia(MOBILE_QUERY).matches) {
        root.dataset.view = "map";
      }
    };

    for (const item of items) {
      item.addEventListener("click", () => select(item));
    }

    for (const detail of details) {
      detail.querySelector("[data-store-close]")?.addEventListener("click", () => {
        showDetail(null);
        items
          .find((item) => item.dataset.storeId === detail.dataset.storeDetail)
          ?.focus({ preventScroll: true });
      });

      const toggle = detail.querySelector("[data-store-hours-toggle]");
      const table = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
      toggle?.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(open));
        if (table) table.hidden = !open;
      });
    }

    // 營業狀態：以台北時間判斷，文案範本放在容器的 data-hours-open／closed（由字典帶入，{time} 會被換掉）。
    const updateHours = (detail) => {
      const status = detail.querySelector("[data-store-hours-status]");
      const rows = [...detail.querySelectorAll("tr[data-weekday]")];
      if (!status || !rows.length) return;

      const now = taipeiNow();
      const toMinutes = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      };
      const byDay = new Map(rows.map((row) => [Number(row.dataset.weekday), row]));

      for (const row of rows)
        row.toggleAttribute("data-today", Number(row.dataset.weekday) === now.day);

      const today = byDay.get(now.day);
      if (today?.dataset.open && today.dataset.close) {
        const open = toMinutes(today.dataset.open);
        const close = toMinutes(today.dataset.close);
        if (now.minutes >= open && now.minutes < close) {
          status.textContent = (root.dataset.hoursOpen ?? "").replace(
            "{time}",
            today.dataset.close
          );
          return;
        }
        if (now.minutes < open) {
          status.textContent = (root.dataset.hoursClosed ?? "").replace(
            "{time}",
            today.dataset.open
          );
          return;
        }
      }

      // 今天已打烊或公休：往後找下一個營業日的開門時間。
      for (let offset = 1; offset <= 7; offset += 1) {
        const row = byDay.get((now.day + offset) % 7);
        if (row?.dataset.open) {
          status.textContent = (root.dataset.hoursClosed ?? "").replace("{time}", row.dataset.open);
          return;
        }
      }
      status.textContent = "";
    };

    // 不論瀏覽者在哪個時區，都用門市所在的台北時間判斷。
    const taipeiNow = () => {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Taipei",
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        })
          .formatToParts(new Date())
          .map((part) => [part.type, part.value])
      );
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
      return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
    };

    switcher?.addEventListener("click", () => {
      root.dataset.view = root.dataset.view === "list" ? "map" : "list";
    });

    render();
    showDetail(active().dataset.storeId ?? null);
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
