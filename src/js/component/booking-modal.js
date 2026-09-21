// 預約服務彈跳視窗：開關、兩個步驟之間的切換，以及兩張表單的前端驗證。
//
// 驗證的規則與 src/js/contact.js 相同（data-invalid 屬性驅動錯誤樣式、
// [data-booking-error] 的 hidden 切換、已標錯的欄位在使用者修正時即時解除），
// 只是那支是 ES5 寫法、這支改用 ES6+。後端尚未串接：step2 通過驗證後就直接關閉彈窗。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以仍然包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const STEP_ANIMATION_MS = 440;

  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 驗證 ----------

  // 欄位被包在 <div class="relative"> 或 <label> 裡的情況不一，
  // 所以從欄位往上找第一個「有錯誤訊息當兄弟節點」的層級，不依賴 class 名稱。
  const errorNodeFor = (field) => {
    let node = field;
    while (node?.parentElement) {
      const error = node.parentElement.querySelector(":scope > [data-booking-error]");
      if (error) return error;
      node = node.parentElement;
    }
    return null;
  };

  const isFilled = ({ type, checked, value }) => {
    if (type === "checkbox") return checked;
    if (type === "email") return EMAIL_PATTERN.test(value.trim());
    return value.trim() !== "";
  };

  const setValidity = (field, valid) => {
    if (field.type === "checkbox") {
      // 同意項的方框樣式是圖示自己切換的，只需要顯示／隱藏錯誤訊息。
      field.setAttribute("aria-invalid", valid ? "false" : "true");
    } else {
      field.toggleAttribute("data-invalid", !valid);
      field.setAttribute("aria-invalid", valid ? "false" : "true");
    }

    const error = errorNodeFor(field);
    if (error) error.hidden = valid;
  };

  const clearValidity = (field) => {
    field.removeAttribute("data-invalid");
    field.removeAttribute("aria-invalid");

    const error = errorNodeFor(field);
    if (error) error.hidden = true;
  };

  const fieldsOf = (form) => [...form.querySelectorAll("[data-booking-field]")];

  // 全部驗證一輪，回傳第一個沒過的欄位（都通過就回 null）。
  const validate = (form) =>
    fieldsOf(form).reduce((firstInvalid, field) => {
      const valid = isFilled(field);
      setValidity(field, valid);
      return firstInvalid ?? (valid ? null : field);
    }, null);

  // ---------- 摘要 ----------

  // <input type="date"> 的值固定是 YYYY-MM-DD，摘要要顯示成設計稿的 2026/7/27。
  const formatDate = (value) => {
    const parts = value.split("-");
    if (parts.length !== 3) return value;

    const [year, month, day] = parts;
    return `${year}/${Number(month)}/${Number(day)}`;
  };

  // step2 的摘要列直接取 step1 控制項「顯示出來的文字」，這樣切語系後帶過去的值也是對的。
  const fillSummary = (modal, form) => {
    for (const node of modal.querySelectorAll("[data-booking-summary]")) {
      const field = form.elements[node.dataset.bookingSummary];
      if (!field) continue;

      if (field.tagName === "SELECT") {
        node.textContent = field.options[field.selectedIndex].textContent.trim();
      } else if (field.type === "date") {
        node.textContent = formatDate(field.value);
      } else {
        node.textContent = field.value;
      }
    }
  };

  // ---------- 步驟切換 ----------

  const setupSteps = (modal) => {
    const steps = modal.querySelector("[data-booking-steps]");
    const panels = Object.fromEntries(
      [...modal.querySelectorAll("[data-booking-step]")].map((panel) => [
        panel.dataset.bookingStep,
        panel,
      ])
    );

    let current = "1";
    // 動畫還在跑的時候又被切換（例如連點「返回」），要先把上一輪收尾做完，
    // 否則上一輪的 timeout 會把新顯示的那一頁藏起來。
    let finishPending = null;

    const settle = () => finishPending?.();

    const reset = () => {
      settle();
      if (current === "1") return;

      panels[current].hidden = true;
      panels["1"].hidden = false;
      current = "1";
    };

    const goTo = (next, direction) => {
      if (next === current || !panels[next]) return;
      settle();

      const from = panels[current];
      const to = panels[next];
      current = next;

      if (prefersReducedMotion()) {
        from.hidden = true;
        to.hidden = false;
        return;
      }

      // 高度過渡：先把容器釘在舊高度，換完內容量出新高度再放手，
      // transition 結束後清掉行內 height，讓容器回到內容自適應（欄位出現錯誤訊息時才會跟著長高）。
      const startHeight = steps.offsetHeight;

      steps.dataset.bookingDir = direction;
      from.classList.add("is-leaving");
      to.hidden = false;
      to.classList.add("is-entering");

      steps.style.height = `${startHeight}px`;
      const endHeight = to.offsetHeight;
      // 讀取 offsetHeight 已經強制 reflow，下一行的新值才會被當成過渡的終點。
      steps.style.height = `${endHeight}px`;

      const finish = () => {
        window.clearTimeout(timer);
        finishPending = null;
        from.hidden = true;
        from.classList.remove("is-leaving");
        to.classList.remove("is-entering");
        steps.style.height = "";
        delete steps.dataset.bookingDir;
      };

      const timer = window.setTimeout(finish, STEP_ANIMATION_MS);
      finishPending = finish;
    };

    return { goTo, reset };
  };

  // ---------- 開關 ----------

  // 行動版抽屜開著的時候按 CTA，要先把抽屜收掉。這一步刻意由這裡做而不是交給 header.js：
  // 抽屜自己的關閉流程會把 body 的 overflow-hidden 拔掉，順序一交錯就會把彈窗的捲動鎖一起清掉。
  const closeHeaderDrawer = () => {
    const drawer = document.querySelector("[data-header-drawer]");
    if (!drawer?.classList.contains("is-open")) return;

    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.querySelector("[data-drawer-open]")?.setAttribute("aria-expanded", "false");
  };

  const init = () => {
    const modal = document.querySelector("[data-booking-modal]");
    if (!modal) return;

    const scroll = modal.querySelector(".booking-modal__scroll");
    const stepOne = modal.querySelector('[data-booking-form="1"]');
    const stepTwo = modal.querySelector('[data-booking-form="2"]');
    if (!stepOne || !stepTwo) return;

    const steps = setupSteps(modal);
    const forms = [stepOne, stepTwo];
    let lastTrigger = null;

    const isOpen = () => modal.classList.contains("is-open");

    const open = (trigger) => {
      lastTrigger = trigger ?? null;
      closeHeaderDrawer();
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("overflow-hidden");
      if (scroll) scroll.scrollTop = 0;
    };

    const close = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("overflow-hidden");
      lastTrigger?.focus({ preventScroll: true });
      lastTrigger = null;
    };

    // 送出後把兩張表單清乾淨，下一次開啟才不會殘留上一筆的值與錯誤狀態。
    const resetForms = () => {
      for (const form of forms) {
        form.reset();
        fieldsOf(form).forEach(clearValidity);
      }
      steps.reset();
    };

    document.addEventListener("click", (event) => {
      const { target } = event;
      if (!(target instanceof Element)) return;

      const trigger = target.closest("[data-booking-open]");
      if (trigger) {
        event.preventDefault();
        open(trigger);
        return;
      }

      // 點在面板以外的地方（遮罩或捲動層的留白）就關閉。
      if (!isOpen()) return;
      if (!modal.contains(target) || target.closest(".booking-modal__panel")) return;
      close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) close();
    });

    for (const form of forms) {
      for (const field of fieldsOf(form)) {
        // 已經標成錯誤的欄位，使用者一邊修正就一邊解除，不必等到再次送出。
        const revalidate = () => {
          if (field.getAttribute("aria-invalid") === "true") setValidity(field, isFilled(field));
        };

        field.addEventListener("input", revalidate);
        field.addEventListener("change", revalidate);
      }
    }

    stepOne.addEventListener("submit", (event) => {
      event.preventDefault();

      const firstInvalid = validate(stepOne);
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      fillSummary(modal, stepOne);
      steps.goTo("2", "forward");
    });

    modal.querySelector("[data-booking-back]")?.addEventListener("click", () => {
      steps.goTo("1", "back");
    });

    stepTwo.addEventListener("submit", (event) => {
      event.preventDefault();

      const firstInvalid = validate(stepTwo);
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // 後端還沒串接：通過驗證就當作送出成功，直接關閉彈窗。
      close();
      resetForms();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
