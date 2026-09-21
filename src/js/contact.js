// 聯絡我們頁的表單驗證與送出狀態切換。
//
// 後端尚未串接：這支只做前端必填／格式檢查，通過後把表單換成設計稿的「已發送」畫面。
// 之後要接 API 時，把 showComplete() 換成送出成功的 callback 即可。
//
// 錯誤樣式由欄位上的 data-invalid 屬性驅動（HTML 用 data-invalid: 變體寫死樣式），
// 錯誤訊息則是欄位群組裡那個 [data-contact-error] 的 hidden 切換。
(function () {
  "use strict";

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function errorNodeFor(field) {
    // 欄位被包在 <div class="relative"> 或 <label> 裡的情況不一，
    // 所以從欄位往上找第一個「有錯誤訊息當兄弟節點」的層級，不依賴 class 名稱。
    var node = field;
    while (node && node.parentElement) {
      var error = node.parentElement.querySelector(":scope > [data-contact-error]");
      if (error) return error;
      node = node.parentElement;
    }
    return null;
  }

  function isFilled(field) {
    if (field.type === "checkbox") return field.checked;
    if (field.type === "email") return EMAIL_PATTERN.test(field.value.trim());
    return field.value.trim() !== "";
  }

  function setValidity(field, valid) {
    var error = errorNodeFor(field);

    if (field.type === "checkbox") {
      // 同意項的方框樣式是圖示自己切換的，只需要顯示／隱藏錯誤訊息。
      field.setAttribute("aria-invalid", valid ? "false" : "true");
    } else if (valid) {
      field.removeAttribute("data-invalid");
      field.setAttribute("aria-invalid", "false");
    } else {
      field.setAttribute("data-invalid", "");
      field.setAttribute("aria-invalid", "true");
    }

    if (error) error.hidden = valid;
  }

  function init() {
    var form = document.querySelector("[data-contact-form]");
    var complete = document.querySelector("[data-contact-complete]");
    if (!form || !complete) return;

    var fields = Array.prototype.slice.call(form.querySelectorAll("[data-contact-field]"));

    fields.forEach(function (field) {
      // 已經標成錯誤的欄位，使用者一邊修正就一邊解除，不必等到再次送出。
      var revalidate = function () {
        if (field.getAttribute("aria-invalid") === "true") setValidity(field, isFilled(field));
      };

      field.addEventListener("input", revalidate);
      field.addEventListener("change", revalidate);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;

      fields.forEach(function (field) {
        var valid = isFilled(field);
        setValidity(field, valid);
        if (!valid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      form.hidden = true;
      complete.hidden = false;
      complete.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
