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

  // 我們的團隊頁（src/pages/team.html）。
  "team.meta.title": "我們的團隊｜永新鐘錶百達翡麗專賣店",
  "team.meta.description":
    "認識永新鐘錶百達翡麗專賣店的團隊，八位鐘錶顧問以專業與真誠，陪伴每一位藏家走過收藏旅程。",
  "team.hero.eyebrow": "Our Team",
  "team.hero.title": "我們的團隊",

  // 職稱：後六位成員都是銷售顧問，共用同一個 key。
  "team.role.gm": "總經理",
  "team.role.manager": "經理",
  "team.role.sales": "銷售顧問",

  // 成員簡介：段落之間用 \n，搭配 HTML 的 whitespace-pre-line（不能寫 <br>）。
  "team.member.henryLai.bio":
    "在名錶薈萃與顧客期待交織的頂級鐘錶世界裡，身為永新鐘錶第二代經營者，Henry 始終抱持感恩與謙遜，他認為頂級鐘錶服務真正珍貴的，早已超越產品本身，而是一份長久累積的信任，以如朋友、家人般的真誠交流，與客戶建立深厚而長久的關係。這份長期價值的堅持也呼應了他所認同的百達翡麗「傳承」精神——從製錶工藝、銷售服務到維修保養，始終重視品質與時間的累積，而非追逐一時的市場熱度。對 Henry 而言，永新鐘錶所傳承的不只是鐘錶事業，更是一份關於時間、信任與工藝的價值。\n面對鐘錶市場的快速變化，Henry 觀察到「價值觀會改變審美觀」。在他眼中，鐘錶不只是收藏品，更承載著一個人的品味、個性與人生選擇。因此，他以「先交流，再交心，再交易」為理念，希望透過交流，陪伴藏家跳脫市場與社群的主流眼光，重新找回收藏最純粹的樂趣，選擇真正符合自身品味的時計。",
  "team.member.leoChuang.bio":
    "於永新鐘錶服務近三十年，鐘錶業的服務精神早已深植於莊良鈺的 DNA。一路走來，不僅見證永新成為台灣高級鐘錶市場具指標性的品牌，也體會到百達翡麗的工藝、傳承與品牌價值獲得市場的高度認同。面對高端藏家，他始終認為，專業是立足的根本，而真誠與信任更是建立長久關係的關鍵。真正的信任從來不是一朝一夕，而是透過每一次的用心互動，在歲月中積累而成。\n重情重義的天蠍座性格，始終秉持「別人對你好，就要加倍對別人好。」的信念，將一路支持永新的藏家放在心上，以感恩的心守護長年累積的信任，珍惜每一份託付，盡力回應顧客的需求。未來也將持續秉持這份熱忱與初心，用心經營每一段緣分，回應每一位選擇永新的朋友。",
  "team.member.jayChien.bio":
    "深耕永新鐘錶近二十年，資深銷售顧問簡士傑始終保持對高級鐘錶的熱情。當初踏入鐘錶產業，源自於興趣與喜愛，而這份熱忱也隨著歲月累積成深厚的專業。每逢品牌推出新品，總會持續掌握製錶技術與設計的最新發展，再將所學轉化為與顧客分享的樂趣。\n對簡士傑而言，百達翡麗最令人著迷之處，在於兼顧傳承與創新。深厚的家族歷史與獨立經營傳統，讓品牌得以延續經典，同時持續挑戰製錶工藝的無限可能。面對專業且眼光獨到的收藏家，他以專業知識與長期陪伴建立信任，依照每位藏家的需求與收藏歷程，從經典開始，逐步探索功能性、高複雜乃至頂級典藏作品，陪伴收藏一路成長。未來，他也期許持續累積專業、提升服務品質，與永新鐘錶及品牌一同走得更長久，陪伴更多鐘錶愛好者探索高級製錶的魅力。",
  "team.member.carlKao.bio":
    "深耕高級鐘錶領域、進入永新鐘錶百達翡麗專館服務超過十一年，高楷聖始終秉持對機械工藝的熱忱與求知精神，透過持續的自主研究與專業培訓，以專業為核心，深入研究產品並提供詳細解說，讓客戶更容易理解產品價值，為客戶提供兼具專業度與溫度的諮詢服務。\n高度認同百達翡麗的獨立製錶精神與精湛工藝，使高楷聖對品牌價值的傳遞充滿使命感。深信機械錶不僅是計時工具，更是工藝、品味與身分的重要象徵。其服務理念以客戶需求為核心，力求做到最好、最完善，以專業和細心提供符合不同客戶需求的服務。未來，將持續以匠心精神深耕專業，協助每一位客戶尋找專屬於己的時計臻品。",
  "team.member.elmoWang.bio":
    "擁有時尚精品銷售經驗的王士瑋，將精品所累積的美學品味與服務經驗，融會於高級鐘錶領域，成為自身獨特的專業優勢。他重視高效、簡潔且精準的溝通，認為鐘錶是一門深厚的學問，專業顧問的價值，在於能以最清楚的方式，將機芯運作、設計理念與品牌故事轉化為顧客容易理解的語言，讓顧客在理解腕錶工藝的同時，也能感受其中的賞玩樂趣，進而建立對品牌的認同與信任。\n面對市場行情的起伏與熱門款式的追逐，王士瑋始終給予顧客最直接的建議：「喜歡最重要。」他認為，收藏不應被市場價格或流行趨勢牽著走，唯有選擇真正喜愛的腕錶，才能獲得長久的情感滿足與陪伴。這份務實的態度，也讓他忠於鐘錶服務最純粹的價值——尊重每一位顧客的選擇，享受收藏最純粹的樂趣。",
  "team.member.dorisChen.bio":
    "具有鐘錶媒體工作背景的陳臆婷，帶著對鐘錶的熱愛，從媒體人轉型以銷售的身份，開啟了腕錶銷售顧問之路。憑藉著過去積累的專業知識，當面對顧客時，不僅提供了愉快且輕鬆的互動氛圍，也能提供更具深度的分析。「我希望讓顧客明白，他所購買的不僅是一只錶，更是一份值得擁有的價值。」\n在加入百達翡麗後，陳臆婷體會到品牌最經典的廣告語：「沒有人能真正擁有百達翡麗，只不過是為下一代保管而已。」「這不僅是一個口號，在現實中我也看到許多社會地位極高的顧客，他們購買手錶是為了傳給孩子、妻子或是家人。」她認為，擁有兩百多年歷史底蘊的百達翡麗，其耐用與經典正是支撐這份傳承意義的基石。",
  "team.member.phoebeChen.bio":
    "具有金融業相關經歷的陳璇，在她眼中，一只頂級腕錶承載的不只是紀錄時間的軌跡，更凝聚了品牌歷史、設計美學與個人品味。從細微零件的打磨到複雜機械結構，每一個細節都是製錶工藝的累積；而顧客選擇佩戴的腕錶，也往往映照出自身的風格與生活態度。\n面對高階消費客群，她認為「真誠」與「專業」是建立信任的關鍵。她始終站在客戶的角度思考，透過換位思考與真誠交流，縮短彼此距離，建立長久的信任關係。面對網路資訊高度普及，陳璇也認為銷售顧問的重要角色之一，是協助顧客建立正確的期待，透過專業溝通，讓顧客真正理解品牌背後的精神與價值，讓每一次選錶，都建立在充分理解與信任之上。",
  "team.member.jessieJiang.bio":
    "多年來專注於鐘錶領域，江詠婕在第一線服務中累積了豐富的經驗，也深刻理解不同階段藏家對腕錶的需求與憧憬。面對初次到店、或許有些拘謹的顧客，她總以親切、自然的方式營造放鬆的交流氛圍，傾聽每個人的喜好與收藏想法。對她而言，唯有真正了解，才能提供適合的建議，陪伴顧客一步步建立屬於自己的收藏。\n江詠婕也見證著百達翡麗「傳承」最真實的樣貌——百達翡麗「一代傳一代」的精神在永新鐘錶不是一句口號，而是每天都在發生的真實故事。許多數十年前在這裡購錶的老客戶，如今帶著珍藏多年的腕錶回店維護保養，只為將這份珍貴的經典完整交給下一代，甚至下下一代。這也成為她對服務的期許：不只陪伴當下的藏家，更希望以十年、二十年甚至更長的時間，持續成為整個家族世代信任的專屬鐘錶顧問，讓腕錶所承載的情感與價值，在時間中延續。",

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
