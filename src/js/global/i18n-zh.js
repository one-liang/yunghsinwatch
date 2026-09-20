// 繁體中文文字檔（預設語系，也是 HTML 原始碼裡直接寫死的那一份）。
// 只負責把字典掛到 window.SITE_I18N，套用邏輯在 i18n.js。
window.SITE_I18N = window.SITE_I18N || {};

window.SITE_I18N.zh = {
  "brand.line1": "永新鐘錶百達翡麗專賣店",
  "brand.line2": "",

  "nav.collection": "時計系列",
  "nav.boutique": "品牌專賣店",
  "nav.boutique.store": "精品店",
  "nav.boutique.team": "我們的團隊",
  "nav.boutique.about": "關於永新",
  "nav.service": "維修保養",
  "nav.contact": "聯絡我們",

  "cta.booking": "預約服務",

  "lang.zh": "ZH",
  "lang.en": "EN",

  "collection.meta.title": "時計系列｜永新鐘錶百達翡麗專賣店",
  "collection.meta.description": "探索百達翡麗時計系列，領略品牌對製錶工藝、品質與創新的堅持。",
  "collection.heading": "百達翡麗時計系列",
  "collection.description":
    "百達翡麗常規系列擁有逾150個錶款型號，每款作品均限量生產，旨在確保符合百達翡麗印記的至高品質標準。",

  // 單系列列表頁（src/pages/collection/series.html），各系列共用同一份版型。
  "series.meta.title": "Golden Ellipse 系列｜永新鐘錶百達翡麗專賣店",
  "series.meta.description":
    "探索百達翡麗 Golden Ellipse 系列，感受經典橢圓造型與和諧比例所展現的優雅美學。",
  "series.headingSuffix": " 系列",
  "series.description":
    "深入探索 Golden Ellipse 系列的迷人世界，其悠久歷史在百達翡麗各大時計中位列第二，僅次於 Calatrava 系列。",
  "series.watchName": "GOLDEN ELLIPSE 腕錶",
  "series.discoverTitle": "繼續探索",

  // 單錶介紹頁（src/pages/collection/model.html）。
  // model.spec.*.label 為各頁共用的規格欄位名稱，model.spec.*.value 為此錶款的內容。
  "model.meta.title": "GOLDEN ELLIPSE 5204G-010 腕錶｜永新鐘錶百達翡麗專賣店",
  "model.meta.description":
    "認識百達翡麗 GOLDEN ELLIPSE 5204G-010 腕錶，橄欖綠色放射狀錶面搭配白金錶殼，展現經典橢圓造型的和諧比例。",
  "model.nameSuffix": " 腕錶",
  "model.description":
    "CHR 29-535 PS Q 人手上弦機芯，配備雙針計時秒時功能和萬年曆。備有雙導柱輪及橫向離合器。30 分鐘瞬跳計算器位於錶面 3 時位置。小三針位於 9 時位置。七項專利創新技術，其中六項用於計時功能，一項用於雙針計時秒裝置。海軍藍色放射狀錶面，錶面 12 時位置以雙顯示窗展示星期及月份。6 時位置顯示月相，並以指針展示日期。速度計刻度以白色印製。40 毫米白金錶殼全經拋光處理。海軍藍色複合物料錶帶綴以織物圖案，搭配紅色縫線，呈現鮮明的對比，搭配白金專利三片式摺疊扣。額外奉附深藍色鱷魚皮錶帶，作為百達翡麗天文顯示時計悠久傳統的延續之作。",
  "model.recommendWatchName": "GOLDEN ELLIPSE 腕錶",
  "model.recommendTitle": "推薦其他腕錶",

  "model.spec.dial.label": "錶面",
  "model.spec.dial.value":
    "橄欖綠色放射狀，白金巴頓式立體小時刻度；18K 金錶面底板；白金「cheveu」式指針",
  "model.spec.case.label": "錶殼",
  "model.spec.case.value": "白金製；大小：31.1 x 35.6 毫米；厚度：5.9 毫米",
  "model.spec.waterResistance.label": "防水深度",
  "model.spec.waterResistance.value": "防水深度 30 米",
  "model.spec.caseBack.label": "錶殼底蓋/錶背",
  "model.spec.caseBack.value": "實心錶殼底蓋",
  "model.spec.strap.label": "錶帶",
  "model.spec.strap.value": "小牛皮，亮麗橄欖綠色；白金針扣",
  "model.spec.gemSetting.label": "寶石鑲嵌",
  "model.spec.gemSetting.value": "無鑲鑽",
  "model.spec.movement.label": "機芯",
  "model.spec.movement.value": "240 機芯；超薄；自動上弦；頻率：21,600 次/小時",
  "model.spec.powerReserve.label": "動力儲備",
  "model.spec.powerReserve.value": "最少 48 小時",
  "model.spec.display.label": "顯示器",
  "model.spec.display.value": "時針、分針",
  "model.spec.seal.label": "印記",
  "model.spec.seal.value": "百達翡麗印記",

  // 專賣店介紹頁（src/pages/boutique.html）與 store-locator 組件共用。
  // 門市名稱與地址整理自百達翡麗官方銷售點的台灣地區列表，目前只列台北 4 處。
  "boutique.meta.title": "品牌專賣店｜永新鐘錶百達翡麗專賣店",
  "boutique.meta.description":
    "走進永新鐘錶百達翡麗專賣店，感受稀缺工藝與精準美學交織的空間，並查詢台北地區的官方銷售點。",
  "boutique.hero.eyebrow": "Boutique",
  "boutique.hero.title": "永新鐘錶百達翡麗專賣店",
  "boutique.intro.title": "聚光燈下的鐘錶城堡",
  "boutique.intro.body":
    "以「稀缺工藝」與「精準美學」，永新百達翡麗專館透過傳承與創新，訴說時間的璀璨永恆。",
  // 換行靠 CSS 的 whitespace-pre-line 呈現；i18n runtime 只改 textContent，
  // 寫 <br> 會在切語系時被吃掉。
  "boutique.story.body":
    "在時間的長河中，鐘錶不僅是計時工具，\n更是藝術、工藝與情感的載體。\n永新鐘錶以深厚的技藝底蘊與誠信的經營哲學，\n成為無數愛錶人士心中的殿堂。",
  // MD 以下設計稿把最後兩句合成一段、讓它自然折行（共 4 行），
  // 桌機則是四句各一行。兩種斷行差一行高度，所以拆成兩個 key。
  "boutique.story.bodySm":
    "在時間的長河中，鐘錶不僅是計時工具，\n更是藝術、工藝與情感的載體。\n永新鐘錶以深厚的技藝底蘊與誠信的經營哲學，成為無數愛錶人士心中的殿堂。",
  "boutique.carousel.prev": "上一張",
  "boutique.carousel.next": "下一張",
  "boutique.appointment.title": "我要預約",
  "boutique.appointment.subtitle": "Schedule an Appointment",

  "store.view.list": "門市列表",
  "store.view.map": "地圖檢視",
  "store.map.title": "門市位置地圖",

  "store.yungHsin.name": "永新鐘錶百達翡麗專賣店",
  "store.yungHsin.address": "台北市士林區忠誠路一段 82 號",
  "store.cortina.name": "高登鐘錶百達翡麗專賣店",
  "store.cortina.address": "台北市信義區市府路 45 號 台北 101 購物中心 2 樓",
  "store.kingSign.name": "金生儀鐘錶百達翡麗專賣店",
  "store.kingSign.address": "台北市大安區忠孝東路四段 231-1 號",
  "store.nineTwo.name": "九二鐘錶百達翡麗專賣店",
  "store.nineTwo.address": "台北市大同區延平北路一段 109 號",

  "footer.address": "台北市士林區忠誠路一段 82 號 (第一銀行旁)",
  "footer.terms": "服務條款",
  "footer.privacy": "隱私權政策",
  "footer.copyright": "© 2026 Yung Hsin Watch. All rights reserved.",
};
