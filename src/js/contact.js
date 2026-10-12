// 聯絡我們頁的表單驗證、送出狀態切換，以及居住國家連動電話國碼。
//
// 後端尚未串接：這支只做前端必填／格式檢查，通過後把表單換成設計稿的「已發送」畫面。
// 之後要接 API 時，把 showComplete() 換成送出成功的 callback 即可。
//
// 錯誤樣式由欄位上的 data-invalid 屬性驅動（HTML 用 data-invalid: 變體寫死樣式），
// 錯誤訊息則是欄位群組裡那個 [data-contact-error] 的 hidden 切換。
// 同一套規則也用在預約彈跳視窗（src/js/component/booking-modal.js），兩處要改請一起改。
//
// builder 是純 concat 注入（非 module，不能用 import/export），
// 所以包成 IIFE，避免頂層的 const 與同一包裡其他腳本撞名。
(() => {
  "use strict";

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 欄位被包在 <div class="relative"> 或 <label> 裡的情況不一，
  // 所以從欄位往上找第一個「有錯誤訊息當兄弟節點」的層級，不依賴 class 名稱。
  const errorNodeFor = (field) => {
    let node = field;
    while (node?.parentElement) {
      const error = node.parentElement.querySelector(":scope > [data-contact-error]");
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

  // 居住國家／地區連動聯絡電話國碼（Figma Mockup comment #20）。
  // 國碼寫在國家選項的 data-dial-code；國碼選單列出所有不重複的國碼（依字串排序，+1 的加勒比海
  // 各地會接在 +1 後面），切換國家時自動帶入對應國碼，使用者仍可手動改成其他國碼。
  const initDialCode = (form) => {
    const country = form.querySelector("[data-contact-country]");
    const dialCode = form.querySelector("[data-contact-dial-code]");
    if (!country || !dialCode) return;

    const codes = [...new Set([...country.options].map(({ dataset }) => dataset.dialCode))]
      .filter(Boolean)
      .sort();
    dialCode.replaceChildren(...codes.map((code) => new Option(`+${code}`, `+${code}`)));

    const sync = () => {
      const code = country.selectedOptions[0]?.dataset.dialCode;
      if (code) dialCode.value = `+${code}`;
    };

    country.addEventListener("change", sync);
    sync();
  };

  const init = () => {
    const form = document.querySelector("[data-contact-form]");
    const complete = document.querySelector("[data-contact-complete]");
    if (!form || !complete) return;

    initDialCode(form);

    const fields = [...form.querySelectorAll("[data-contact-field]")];

    for (const field of fields) {
      // 已經標成錯誤的欄位，使用者一邊修正就一邊解除，不必等到再次送出。
      const revalidate = () => {
        if (field.getAttribute("aria-invalid") === "true") setValidity(field, isFilled(field));
      };

      field.addEventListener("input", revalidate);
      field.addEventListener("change", revalidate);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const firstInvalid = fields.reduce((found, field) => {
        const valid = isFilled(field);
        setValidity(field, valid);
        return found ?? (valid ? null : field);
      }, null);

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      form.hidden = true;
      complete.hidden = false;
      window.SITE_SCROLL.scrollTo(complete, { block: "center" });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
