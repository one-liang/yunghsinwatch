# Figma Mockup Comment 待辦清單

- 來源：[百達翡麗專賣店\_官方網站 / Mockup](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=149-98)（頁面 `149:98`）
- 擷取日期：#2～#15 於 2026-10-05 擷取（14 則 comment + 3 則回覆），#16～#21 於 2026-10-08 擷取（6 則 comment + 1 則回覆），
  #22～#23 與 #20、#21 的追加需求於 2026-10-12 擷取（2 則 comment + 3 則回覆）。comment 作者皆為 Ping；
  Liang 的回覆只收錄有附帶說明、或該則仍有未勾選項目的，其餘都是「已調整」
- 排序：依 frame 在畫布上的位置（由上到下、由左到右），同一 frame 內依 pin 由上到下
- `#` 為 Figma comment 的 order id，方便回 Figma 對照
- Layer 路徑是用 comment pin 座標比對出的最深 layer（Figma 只把 comment 綁在頂層 frame），僅供定位參考

完成後把 `- [ ]` 改成 `- [x]`。

## 進度總覽

- [x] #8 【全站】按鈕 Hover 效果
- [ ] #14 【Header】切換 Header 時由上往下展開
- [x] #7 【首頁】Banner 高度與影片
- [x] #6 【首頁】Scroll 動畫
- [x] #9 【首頁、時計系列】卡片圖片 Hover 放大
- [x] #23 【全站 Footer】版權文字刪除 Watch 後的句點
- [ ] #15 【Header】MD / LG 尺寸使用 scroll 版 Header
- [x] #16 【單系列列表】單錶卡片型號與名稱字型大小
- [x] #10 【單系列列表、單錶介紹頁】手錶名稱 Hover 效果
- [x] #12 【單系列列表、單錶介紹頁】Scroll 動畫
- [x] #17 【單錶介紹頁】型號、名稱與價格字型大小
- [x] #11 【精品店】進站 Scroll 動畫
- [x] #5 【精品店】圖片輪播
- [ ] #2 【精品店】Google 地圖嵌入
- [x] #3 【我們的團隊】進站 Scroll 動畫
- [x] #18 【我們的團隊】成員內文更新
- [x] #19 【我們的團隊】簡士傑照片更換
- [x] #22 【我們的團隊】陳臆婷內文刪除最後一段
- [x] #4 【關於永新】進站 Scroll 動畫
- [x] #13 【維修保養】進站 Scroll 動畫
- [x] #20 【聯絡我們】欄位改為「居住國家/地區」（10/12 追加：調整欄位順序、國碼連動）
- [x] #21 【聯絡我們】送出完成畫面標題與文字（10/12 追加：最後一句改寫）

---

## 1. Inder_Hover（`1036:7860`）

### #8 【全站】按鈕 Hover 效果

- Layer：`Inder_Hover > Header_st2 / 2XL > Menu > Menu List / 2XL > Text`
- 留言日期：2026-09-21

> 【全站】
> 按鈕 Hover 效果
> `transition: transform 0.3s ease-out;`

- [x] 全站按鈕加上 Hover 效果，`transition: transform 0.3s ease-out`

實作說明：Style Guide 的按鈕元件沒有 Hover variant，因此將此 comment 視為過場時間規格，
在 `@theme` 設定 `--default-transition-duration: 300ms`、`--default-transition-timing-function: ease-out`
統一全站 hover；另補上子選單 hover 的 40% 黑底，並修正預約按鈕暗化無法補間的問題。
未加入位移／縮放效果，若需要請設計補數值。

## 2. Inder_Scroll（`1036:8990`）

### #14 【Header】切換 Header 時由上往下展開

- Layer：`Inder_Scroll > Header_Scroll / 2XL > Navigation`
- 留言日期：2026-09-21

> 【Header】
> 更換 Header 時，由上往下展示出來（就是那種絲滑感 🤣，不知道它的 transition 是寫什麼）
> 📌 參考網站：https://www.patek.com/en/collection/grand-complications/all-watches?collectionType=current

回覆（Ping）：

```css
transition:
  background-color 0.7s cubic-bezier(0.19, 1, 0.22, 1),
  transform 0.7s cubic-bezier(0.4, 0.05, 0.32, 1);
```

> 是這段嗎？

回覆（Liang，2026-10-05）：

> 有換個方式寫，看有沒有絲滑感XD
> 往下跟往上置頂再看一下動畫有沒有符合你預期，沒有我在看怎麼調

- [ ] 確認參考網站的 transition 寫法
- [ ] Header 切換時由上往下展開

## 3. Index / 2XL（`933:14354`）

### #7 【首頁】Banner 高度與影片

- Layer：`Index / 2XL > Content > Video > Video`
- 留言日期：2026-09-18

> 【首頁】
>
> 1. Banner 設定 `max-height: 675px`
> 2. 影片要用 `<iframe>`

- [x] Banner 設定 `max-height: 675px`
- [x] 影片改用 `<iframe>`

實作說明：Banner 依 Figma 32:15 比例隨寬度縮放，上限 675px，下限暫用 LG 的 480px（SM 版型待 home-responsive 處理）。
影片以 `youtube-nocookie.com/embed/TTIt78URWb4` iframe 嵌入；YouTube 需要 Referer，`file://` 開啟 dist 時無法播放。

### #6 【首頁】Scroll 動畫

- Layer：`Index / 2XL > Content > Article > Group > Featured Card / 2XL > Text`
- 留言日期：2026-09-10

> 【首頁】
> scroll 時下方內容的 Animation
> 📌 參考網站：https://www.furlanmarri.com/

- [x] 首頁 scroll 時下方內容的進場動畫

實作說明：依參考網站的 CSS 實作於 `src/js/global/motion.js`。文字區塊 `data-reveal-group` 內的
`data-reveal-item` 依序往上（2.5rem、旋轉 2°、0.5s，延遲 0.1／0.3／0.5／0.8s）；圖片與影片
`data-reveal-media` 往上 1.25rem 淡入（0.8s、延遲 0.3s）；曲線皆為 cubic-bezier(.25,.46,.45,.94)，
進入視窗即播放一次。

### #9 【首頁、時計系列】卡片圖片 Hover 放大

- Layer：`Index / 2XL > Content > Article > Group > Featured Card / 2XL > IMG`
- 留言日期：2026-09-21

> 【首頁、時計系列】
> 文章卡片與系列卡片的圖片新增 Hover 效果
> `:hover img { transform: scale(1.1); }`
> `transition: transform 0.3s ease-out;`

- [x] 文章卡片圖片 Hover 放大
- [x] 系列卡片圖片 Hover 放大

實作說明：卡片加 `group`，圖片 `group-hover:scale-110` 搭配全站預設 0.3s ease-out 過場，外層 `overflow-hidden` 裁切。
首頁文章卡片的圖片另包一層 div，進場動畫 `data-reveal-media` 移到外層，避免與 hover 縮放互相干擾。

### #23 【全站 Footer】版權文字刪除 Watch 後的句點

- Layer：`Index / 2XL > Footer_st2 /2XL > Bottom > Copyright`
- 留言日期：2026-10-12

> 10/12 改
> Watch後面的.刪除

- [x] 版權文字改為 Figma 的「© 2026 Yung Hsin Watch All rights reserved.」（原本 `footer.copyright` 在中英文字典
      與 `footer.html` 的預設文字都是「Yung Hsin Watch. All rights reserved.」；Footer 為全站共用，各頁一起生效）

實作說明：Figma 首頁與聯絡我們頁的 Footer instance 都已拿掉句點，代表是元件層一起改的。
中英文字典與 `footer.html` 三處一起修改，dist 22 頁都已套用。

## 4. Index / XL（`1088:9597`）

### #15 【Header】MD / LG 尺寸使用 scroll 版 Header

- Layer：`Index / XL > Header_Scroll / 2XL > Navigation > Menu / 2XL > Menu List / 2XL`
- 留言日期：2026-09-21

> 因為我懶得改了 🤣，所以 MD 與 LG 尺寸，我都直接放 scroll 的 Header

回覆（Liang，2026-10-05）：

> 已調整

- [ ] MD、LG 尺寸直接使用 scroll 版 Header

## 5. Series Page / 2XL（`302:185`）

### #16 【單系列列表】單錶卡片型號與名稱字型大小

- Layer：`Series Page / 2XL > Content > Watch > Watch Card > Text > No.`
- 留言日期：2026-10-07

> 10/7 改
> 型號與名稱的字型大小

- [x] 依 Figma 更新單錶卡片型號與名稱的字型大小

實作說明：依 Watch Card（`421:1104`）與 XL／LG／SM 版本修改 `collection-series.css`：型號改為 Inter SemiBold，
LG 以上 20px、以下 18px，行高 32px；名稱改為 16px／28px，並補上 1px 字距。
單錶介紹頁推薦區的 `model-watch-card` 用的是同一個 Figma 元件，目前仍是舊字級，尚未同步。

### #10 【單系列列表、單錶介紹頁】手錶名稱 Hover 效果

- Layer：`Series Page / 2XL > Content > Watch > Watch Card > Text > Name > CH`
- 留言日期：2026-09-21

> 【單系列列表、單錶介紹頁】
> 單錶卡片的手錶名稱新增 Hover 效果
> `decoration-solid`

- [x] 單錶卡片手錶名稱 Hover 底線（`decoration-solid`）

實作說明：hover 卡片任一處時名稱底線由透明漸變為文字色（0.3s ease-out），鍵盤 focus 亦顯示；
Figma 未定義底線粗細與間距，沿用瀏覽器預設。

### #12 【單系列列表、單錶介紹頁】Scroll 動畫

- Layer：`Series Page / 2XL > Content > Recommend > Title > Title > CH`
- 留言日期：2026-09-21

> 【單系列列表、單錶介紹頁】
> scroll 時下方內容的 Animation
> 📌 參考網站：https://www.furlanmarri.com/

- [x] 單系列列表頁 scroll 進場動畫
- [x] 單錶介紹頁 scroll 進場動畫

## 6. Model Page / 2XL（`313:82`）

### #17 【單錶介紹頁】型號、名稱與價格字型大小

- Layer：`Model Page / 2XL > Content > Top > Watch Info > Text > NO.`
- 留言日期：2026-10-07

> 10/7 改
> 型號、名稱與價格的字型大小

- [x] 依 Figma 更新型號、名稱與價格的字型大小

實作說明：依 Watch Info 的 Text（`321:205`）與 XL／LG／SM 版本修改 `collection-model.css`：
型號 Inter SemiBold，LG 以上 36px／44px、以下 28px／40px；名稱 LG 以上 24px／36px（下方留白 8px）、
以下 20px／32px（SM 無下方留白）；價格各尺寸皆為 Inter Medium 20px／32px。

## 7. About The Boutique / 2XL（`308:151`）

### #11 【精品店】進站 Scroll 動畫

- Layer：`About The Boutique / 2XL > Content > Description / 2XL`
- 留言日期：2026-09-21

> 【精品店】
> 一進站 scroll 時下方內容的 Animation
> 📌 參考網站：https://www.furlanmarri.com/

- [x] 精品店頁 scroll 進場動畫

### #5 【精品店】圖片輪播

- Layer：`About The Boutique / 2XL > Content > IMG > IMG`
- 留言日期：2026-08-21

> 【精品店】
> 圖片輪播
> 📌 參考網站：https://www.patek.com/en/museum/the-patek-philippe-museum

- [x] 精品店圖片輪播

實作說明：保留 Figma 版型（slide 置中、左右露出相鄰圖），套用參考站 media-carousel 的效果：
非目前的圖 70% 透明度、放大 1.15 倍，切換時以 1s（LG 以下 0.5s）cubic-bezier(.4,.05,.32,1) 回到原尺寸；
軌道移動 1s cubic-bezier(.19,1,.22,1)；箭頭 hover 放大 1.05 倍，到頭／尾時淡出。

### #2 【精品店】Google 地圖嵌入

- Layer：`About The Boutique / 2XL > Content > Google Map > Map > image 1`
- 留言日期：2026-08-21

> 【精品店】
> Google 嵌入，參考下方文件
> https://docs.google.com/document/d/1p_l4lxgcC3nZUAbjttrs5JIMr80e9jSH/edit?usp=sharing&ouid=111916229300080405221&rtpof=true&sd=true

回覆（Ping）：

> Liang Google 嵌入樣式可以用成第二款嗎？

回覆（Liang，2026-10-05）：

> 已調整，有用第二款，看是不是你想要的，要改回第一款或別的在跟我說

- [x] 回覆 Ping 是否能用第二款嵌入樣式
- [ ] 依參考文件嵌入 Google 地圖

## 8. Our Team / 2XL（`455:1394`）

### #3 【我們的團隊】進站 Scroll 動畫

- Layer：`Our Team / 2XL > Content > Card > Member Card / 2XL > Left_img`
- 留言日期：2026-08-21

> 【我們的團隊】
> 一進站 scroll 時下方內容的 Animation
> 📌 參考網站：https://www.furlanmarri.com/

- [x] 我們的團隊頁 scroll 進場動畫

### #18 【我們的團隊】成員內文更新

- Layer：`Our Team / 2XL > Content > Card > Member Card / 2XL > Right > Description > CH`（pin 在第 1 位賴冠璋）
- 留言日期：2026-10-07

> 10/7 改
> 每位中文內文(含英文)都有修改，有幾位的英文語塊有變粗體

- [x] 依 Figma 更新每位成員的中文內文（含其中的英文）
- [x] 部分成員內文的英文改為粗體

實作說明：中文版依 Figma 更新 7 位成員的內文（簡士傑未變），英文版（`Our Team_EN`）8 位全部改寫。
「英文語塊變粗體」指的是英文版的引言與關鍵句改成 Inter Medium（Henry、Leo、Elmo、Doris、Jessie）；
中文內文裡的英文字（Henry、DNA）在 Figma 改用 Inter Regular，並非粗體。
因為 `data-i18n` 會 escape，builder 新增 `data-i18n-html`（不 escape，含測試），簡介改用它：
英文強調句包 `<strong>`（`[&_strong]:font-medium`），中文裡的英文字包 `<span lang="en">`（`[&_[lang=en]]:font-label`）。
與 Figma 的刻意差異（已與使用者確認）：陳臆婷的中文第 2、3 段在 Figma 重複，只保留寫「陳臆婷」的那段；
王士瑋第二段 Figma 誤植為「王士偉」，統一為「王士瑋」。

### #19 【我們的團隊】簡士傑照片更換

- Layer：`Our Team / 2XL > Content > Card > Member Card / 2XL > Left_img`（第 3 位，簡士傑 Jay Chien）
- 留言日期：2026-10-07

> 10/7 改
> 此位的照片有更換

回覆（Ping）：

> 雲端上的照片有覆蓋

- [x] 從雲端重新下載簡士傑的照片並替換

實作說明：從 Figma（`486:1514` 的 `Left_img`）取得新照片（原檔 1500×1460），比照其他成員縮成
1100×1070、保留 sRGB 色彩描述檔，覆蓋 `src/assets/images/team/jay-chien.jpg`；中英文頁共用同一張。

### #22 【我們的團隊】陳臆婷內文刪除最後一段

- Layer：`Our Team / 2XL > Content > Card > Member Card / 2XL > Right > Description > CH`（第 6 位，陳臆婷 Doris Chen）
- 留言日期：2026-10-12

> 10/12 改
> 最後一段文字刪除，我沒有刪到 😆

- [x] 刪除陳臆婷中文內文重複的最後一段

實作說明：這是在回覆 #18 提到的重複段落（Liang 回覆「陳臆婷描述兩段一樣，用中文名稱的版本」）。#18 實作時程式就只保留了寫「陳臆婷」的段落。
10/12 擷取時 Figma 的中文內文（`I649:2387;458:1236`）也只剩兩段，和 `team.member.dorisChen.bio` 逐字相同，所以程式不需要再改。

## 9. About Yung-Hsin / 2XL（`460:1547`）

### #4 【關於永新】進站 Scroll 動畫

- Layer：`About Yung-Hsin / 2XL > Content > Description / 2XL`
- 留言日期：2026-08-21

> 【關於永新】
> 一進站 scroll 時下方內容的 Animation
> 📌 參考網站：https://www.furlanmarri.com/

- [x] 關於永新頁 scroll 進場動畫

## 10. Service / 2XL（`462:1686`）

### #13 【維修保養】進站 Scroll 動畫

- Layer：`Service / 2XL > Content > Sevice > Card > Service Card > IMG`
- 留言日期：2026-09-21

> 【維修保養】
> 一進站 scroll 時下方內容的 Animation
> 📌 參考網站：https://www.furlanmarri.com/

- [x] 維修保養頁 scroll 進場動畫

實作說明：#3、#4、#11、#12、#13 與 #6 共用同一套 `data-reveal-group`／`data-reveal-media` 進場動畫；
舊的 `data-reveal`（側邊滑入、2 秒）已全站移除。

## 11. Contact Us / 2XL（`495:1594`）

### #20 【聯絡我們】欄位改為「居住國家/地區」

- Layer：`Contact Us / 2XL > Content > Contact Form > Form > Label`（第 4 個欄位）
- 留言日期：2026-10-08

> 10/7 改
> 改為「居住國家/地區」
> 📌 參考網站：https://www.yunghsinwatch.com/rolex/send-a-message-step2

- [x] 第 4 個欄位改為「居住國家/地區」下拉選單（Figma 預設值為 Taiwan；目前程式為「詢問類別」，選項是時計系列／維修保養／預約服務／其他）
- [x] 依參考網站確認國家/地區的選項清單

實作說明：「詢問類別」整欄換成 `name="country"` 的下拉選單。標籤依 Figma 為「居住國家 / 地區」，
英文版為「Country/Region of Residence」。選項沿用參考網站的 246 筆 ISO 代碼與英文國名，
只拿掉來源 HTML 多出來的 `\'` 反斜線。Figma 中文版也顯示 Taiwan，所以中英文版都用英文國名、不進字典，
預設選 Taiwan。選單文字 Inter Regular 16/28、字距 1px。因為必定有值，這欄不參與必填驗證，也沒有錯誤訊息
（設計稿錯誤狀態同樣沒有）；`contact.field.topic.*` 字典 key 已移除。參考網站選國家會連動國碼，
本站國碼選單目前只有 TW +886，尚未連動。

回覆（Liang，2026-10-09）：

> 已調整，國家/地區就先用上述連結的

回覆（Ping，2026-10-12）：

> 10/12 改
> 「居住國家/地區」位置順序更動

> 新增需求
> 選擇國別之後，下方的電話區碼會自動更換

- [x] 「居住國家 / 地區」移到「電子郵件」與「聯絡電話」之間（Figma 順序：稱謂／姓氏／名字 → 電子郵件 → 居住國家 / 地區 →
      聯絡電話 → 留言內容）
- [x] 選擇國家後自動切換聯絡電話的國碼

實作說明（10/12 追加）：欄位整塊搬到聯絡電話前面，內容沒改。國碼對照取自參考網站：它每次切換國家就 POST
`/rolex/ajax-get-country-code` 查一次，回傳單一選項「+886」（值為 `886`），246 國都是一國一碼。
參考網站的資料有 7 筆明顯錯誤，看起來是沿用了常見的舊 countries 資料表，已修正：
俄羅斯 70→7、土庫曼 7370→993、剛果民主共和國 242→243、科科斯群島 672→61、科索沃 381→383、馬約特 269→262、荷屬聖馬丁 1→1721。
國碼寫在國家選項的 `data-dial-code`，由 `contact.js` 連動。和參考網站刻意不同的地方：國碼選單會列出所有不重複的國碼
（228 個，依字串排序），切換國家時自動帶入，但使用者仍能手動改選，例如住日本但用台灣手機。
顯示格式依 Figma 與參考網站改成「+886」（原本是「TW +886」）。預約彈跳視窗沒有國家欄位，維持原本的單一選項。

## 12. Contact Us / Complete（`506:1626`）

### #21 【聯絡我們】送出完成畫面標題與文字

- Layer：`Contact Us / Complete > Content > Contact Form > Complete`
- 留言日期：2026-10-08

> 10/7 改
> 標題與文字內容有更改

- [x] 依 Figma 更新送出完成畫面的標題與說明文字（目前 `contact.complete.title`／`contact.complete.body` 為「訊息已送出」／「感謝您的詢問，我們將於 2 個工作日內回覆。」，英文版一併確認）

實作說明：標題改為「訊息已發送」，內文改為「感謝您的留言，聯絡訊息已送出，／我們銷售顧問將盡快與您聯繫。」，
依設計稿斷成兩行（字典寫 `\n`），樣式不變。SM 版的「已發送」frame 是隱藏的舊稿、
文字未更新，以 2XL 為準。英文版設計稿沒有已發送畫面，依新的中文語意改寫內文並同樣斷兩行，拿掉「2 個工作日」的承諾；
英文標題「Message Sent」維持不變。

順帶修正的既有問題：dist 會再經 Prettier 格式化並重新折行，所以靠字典 `\n` 加 `whitespace-pre-line` 的段落
在 dist（含已部署的 demo）會被併成一段，英文還會在折行處被硬斷行。dev server 不格式化，因此先前沒發現。
影響範圍包括精品店故事、維修 FAQ、成員簡介與本則完成畫面。builder 改成把字典值裡的 `\n` 輸出成 `<br />`
（含測試），並移除四個頁面共 28 處 `whitespace-pre-line`。

回覆（Ping，2026-10-12）：

> 10/12 改
> 最後一句更改為
> 「我們的專業顧問將會儘快與您聯繫。」

- [x] `contact.complete.body` 第二行由「我們銷售顧問將盡快與您聯繫。」改為「我們的專業顧問將會儘快與您聯繫。」
      （英文版第二行的「our sales consultant」一併改成對應的說法）

實作說明（10/12 追加）：Figma 上只改了第二行，標題、第一行和樣式都沒變。中文字典值與 `contact.html` 的預設文字一起更新。
英文版改成「and our professional consultants will contact you as soon as possible.」，
「專業顧問」沿用英文成員簡介裡的「professional consultant」。

---

# 第二輪：11/20 修改（#28～#46）

- 擷取日期：2026-11-23。範圍是 #28 以後 Ping 的 comment，共 19 則 comment 加 9 則回覆，Liang 都還沒回覆，也都還沒 resolve
- `#` 編號：#28～#32 已和 Figma 留言面板對過；#33 以後是依建立時間順推的，回 Figma 對照時請以留言內容為準
- 大部分 comment 在 Mockup 頁（`149:98`）。#33～#35 在 Style Guide 頁（`94:242`）的 Navbar／Footer frame
- 排序和第一輪一樣，依 frame 在畫布上的位置排，由上到下
- 「目前程式」是擷取當下對照 repo 的狀態，實作前要再看一次 Figma 的實際數值

## 進度總覽（第二輪）

- [x] #33 【全站 Header】Logo 置中、寬度改為 144px
- [x] #34 【全站 Header】子選單上底線改為 hover 時才出現
- [x] #35 【全站 Footer】排版與 mail 更改，2XL 的 FB／IG icon 靠右
- [x] #41 【首頁】Banner 換成 3 張輪播
- [x] #38 #39 #40 【首頁】Banner 三張圖的連結
- [x] #28 【首頁】新增說明文字
- [x] #29 【首頁】影片 iframe 嵌入碼更新
- [x] #42 【時計系列】新增系列
- [x] #30 【精品店】中文標題改為英文
- [x] #43 【精品店】區塊位置對調
- [x] #31 【精品店】地圖右側資訊：營業時間不用下拉、「更多詳情」改為「路線導航」
- [x] #32 【我們的團隊】小標改為「BOUTIQUE」
- [x] #44 【我們的團隊】新增內文（從關於永新搬來）
- [x] #46 【關於永新】第一段的文與圖搬到我們的團隊
- [x] #36 【維修保養】新增內文
- [x] #37 【維修保養】刪除下方標語、「腕錶使用與保養須知」文字大小
- [x] #45 【維修保養】標題字級更改

---

## 實作說明（第二輪）

驗證：`npm run check` 通過（66 個測試、26 頁、1960 個本地引用）；瀏覽器以 1536（2XL）與 393（SM）寬度
逐頁量測區塊高度，和 Figma frame 對得上的都記在下面。

- **#33 Header**：Logo 換成深色版 `logo-patek-philippe-dark.svg`，展開時 144×76 在上排水平、垂直置中，
  收合（88px 高）時回到左側 106×56；Logo 下方的品牌文字與 header.js 裡的淡出補間一起拿掉
  （`tests/header.test.mjs` 同步改成確認不再補間品牌文字）。順著 11/20 Navbar 的配色：底色改 Background、
  文字 Brown/Warm，hover 與目前語系改 Brown/Dark，預約按鈕底色 Brown/Warm、hover 換 Brown/Dark。
  中文選單「品牌專賣店」改為「專賣店」。
- **#34 子選單**：上方的線是子選單本身的上框（Brown/Warm），子選單只在 hover／focus／點開時出現，
  所以線也只在那時出現；底色改 Background。
- **#35 Footer**：拿掉兩個 Logo，聯絡資訊、社群與連結全部置中；mail 改為 `YH@patekboutiquebyyunghsin.com`；
  2XL 的 IG／FB 絕對定位靠右。刪除不再使用的 `footer-x.svg`、`logo-yh-light.svg`、
  `logo-patek-philippe-light.svg`。（Figma MD 的 Footer frame 還是舊 mail，以 2XL 為準。）
- **#41 Banner**：3 張輪播、每 2 秒切換（`src/js/index.js`），比例依 Figma：
  平常 16:9（和原圖同比例，LG 1024×576、XL 1280×720 不裁切），2XL（1536px）以上 1536:800 且不設高度上限，
  寬螢幕等比放大（原本固定 800px 高，螢幕越寬圖被裁越多）；窄螢幕最矮 350px，底圖放大 1.1 倍貼齊底緣（Figma SM）。
  用 aspect-ratio 而非 vw，捲軸寬度不影響比例；圖上原本的文字層保留在 HTML 但加 `hidden`。圖片：用你放在根目錄 `41/` 的「改-01～03」（4000×2250，依序為 5738G、7043G、7340/1R）
  縮成 2400×1350 放進 `src/assets/images/home/hero-*.jpg`（和 Figma 圖層原圖是同一批檔案），
  舊的 `hero-5270p.jpg`、`hero-nautilus.png` 已刪除。
- **#38～#40 Banner 連結**：三張各自連到 demo 站對應錶款（新分頁開啟），網域依你的指示維持
  `pp-yunghsin-demo.hmgroup.com.tw`。
- **#28 首頁說明文字**：Banner 下方新增 Description（標題中英文都用英文；內文中文置中、英文靠左分三段）。
- **首頁 SM 對齊（Index / SM `1088:11080`）**：393 寬逐區量測，Header 68、Banner 350、影片 311、
  聯絡 250、預約 200 與 Figma 相同。卡片標題與內文間距依 Figma 改為 SM 8、LG 16、XL 以上 32。
  其餘差異不是樣式問題：Description SM frame 標題是「Earn trust through integrity…」，LG／2XL 是
  「Patek Philippe Boutique Taipei by Yung Hsin Watch」，程式沿用後者，所以少一行（520 對 552）；
  第一張卡 Figma 內文多一個硬分段；Footer MD frame 的 mail 與連結列行高 24（其他 frame 為 22）且仍是舊 mail。
- **#29 影片嵌入碼**：`PPiframe` 改為 `key="default" banner="true"`，`lang` 依你的指示維持 `en`。
  黑屏修正：banner 模式的播放器自己決定高度（投影片約 2.49:1、最高 45vh），16:9 影片在裡面左右留空，
  原本外層又固定 16:9 黑底，空白處就成了黑屏。現在外層不設比例與底色、高度跟著播放器；`src/js/index.js`
  在播放器的 shadow root 加樣式，把投影片改成 16:9，影片填滿 Figma 的 1200×675。500px 以下官方會改用 9:16 直式影片，
  依你的決定手機也改 16:9（Figma SM 353×199）：把 `Mobile_9x16/*_9x16.mp4` 換成同名的 `Desktop_16x9/*_16x9.mp4`。
- **#42 時計系列**：Twenty~4 後面新增 POCKET WATCHES 卡片，連到 `collection-series.html`（目前其他卡片也連這頁）。
  圖片用根目錄 `42/` 的直式 `10-PP_980J-011`（1440×1920）放進
  `src/assets/images/collection/pocket-watches.jpg`。`41/`、`42/` 兩個資料夾用完已刪除。
- **#30 精品店標題**：中文版大標題也改為「Patek Philippe Boutique Taipei by Yung Hsin Watch」，
  字型同英文版（Playfair Display，Display/XL 40/50）。
- **#43 精品店區塊順序**：依 Figma 改為 Banner → 說明 → 門市地圖 → 輪播 → 故事 → 預約；地圖下方留白
  XL 以上 80px、以下 48px。2XL 各區塊高度 375／296／656／675／344／200，與 Figma 相同。
- **#31 門市資訊**：營業時間不再是下拉，直接顯示；永新改用回覆裡的兩行文字（英文第二行粗體），其他三間
  保留週表並標出今天（台北時間）。「營業中／休息中」狀態一併拿掉（沒有下拉按鈕就沒有放的位置）。
  「更多詳情」改為「路線導航」，連到 Google 地圖路線規劃（`maps/dir/?api=1&destination=…`，依語系帶 `hl`）。
  `store-locator` 只有精品店頁使用。
- **#32 我們的團隊小標**：中英文都改為 BOUTIQUE（中文版 frame 也是）。
- **#44 我們的團隊 Description**：新增 YH Logo（從 Figma 匯出 `src/assets/images/logo-yh.svg`）＋原本關於永新
  第一段文字，下方接原本的店內照片 `about/salon.jpg`；成員卡上方留白依 Figma 改為 SM／LG 72px、XL 以上 112px。
  2XL 437／675、SM 415／199 與 Figma 相同。字典 key 從 `about.intro.body` 改名為 `team.intro.body`。
- **#46 關於永新**：拿掉第一段文字與照片，創辦人段落併入標題區；2XL 標題改 Heading/MD 28/40。
  2XL 各區塊高度 375／376／1112／368／675，與 Figma 相同。
- **#36 維修保養內文**：服務圖片上方新增「快速服務腕錶維護與保養項目」與三組服務項目（中英文依 Service、
  Service_EN）。LG 以上分類在左欄 200px，以下疊在上方；英文分類用 Noto Serif TC SemiBold、內文用 Inter。
  2XL 說明區 780px、SM 1088px，與 Figma 相同。
- **#37 維修保養**：圖片下方的文字（鐘錶養護／保養保固／專業諮詢）刪除，改放到圖片的 alt；
  「腕錶使用與保養須知」字級見 #45。
- **#45 FAQ 標題字級**：只改維修保養頁，SM 20/32、LG 24/36、XL 以上 28/40。

## 13. Style Guide / Navbar（`676:3612`）

### #33 【全站 Header】Header 更改

- Layer：`Navbar > Group > Group > Header_st2 / 2XL`
- 留言日期：2026-11-20

> 11/20 Header 更改

回覆（Ping）：

> 1. Logo置中，寬度改為144px

- [x] Logo 置中，寬度改為 144px（`src/components/header/`）
- [x] 對照 Navbar／Navbar-Scroll／Navbar_EN 看還有沒有其他排版改動（回覆只寫了第 1 點）

### #34 【全站 Header】子選單上底線

- Layer：`Navbar > Group > Group > Group > Sub Menu`
- 留言日期：2026-11-20

> 11/20 更改
> 上底線是滑入時，才出現在這塊上面

- [x] 子選單上方的底線改為 hover（滑入）時才出現

## 14. Style Guide / Footer（`676:4569`）

### #35 【全站 Footer】Footer 更改

- Layer：`Footer > Group > 2XL > Footer_st2 /2XL`
- 留言日期：2026-11-20

> 11/20 Footer更改
>
> 1. 排版更改
> 2. mail更改

回覆（Ping）：

> 2XL尺寸 >
> FB與IG icon位置改為靠右側

- [x] 依 Figma 調整 Footer 排版（各斷點）
- [x] 更新 mail（`src/components/footer/` 與中英文字典）
- [x] 2XL 的 FB、IG icon 改為靠右

## 15. Mockup 左側 Banner 原圖（`1527:9014`、`1527:9016`、`1527:9015`）

畫布最左側的三張 4000×2250 圖，就是 #41 說的「每張已附上連結（在最左側）」。

### #38 #39 #40 【首頁】Banner 三張圖的連結

- 留言日期：2026-11-23

| #   | 圖層                 | 連結                                                        |
| --- | -------------------- | ----------------------------------------------------------- |
| #38 | `01 2`（第 1 張）    | https://pp-yunghsin-demo.hmgroup.com.tw/watch/5738g-001     |
| #39 | `改-02 1`（第 2 張） | https://pp-yunghsin-demo.hmgroup.com.tw/watch/7043g-001     |
| #40 | `改-03 1`（第 3 張） | https://pp-yunghsin-demo.hmgroup.com.tw/watch/7340%7C1r-010 |

- [x] 三張 Banner 各自連到對應網址（張數順序依畫布由上到下，實作前再和 Figma 首頁 Banner 對一次）
- [x] 確認連結網域：目前是 `pp-yunghsin-demo.hmgroup.com.tw` 的 demo 站，正式上線是否要換網域

## 16. Index / 2XL（`933:14354`）

### #41 【首頁】Banner 更換

- Layer：`Index / 2XL > Content > Banner`
- 留言日期：2026-11-23

> 11/20 Banner更換
>
> 1. 每個斷點有更改Banner高度，以及先幫我隱藏文字(它們提供的Banner有壓字)
> 2. 圖片放3張輪播，輪播速度為2秒，每張已附上連結(在最左側)

回覆（Ping）：

> 圖檔 >
> https://drive.google.com/drive/u/0/folders/1sP37T8VEUHDVfMTXBEoxekvsR9yvQgtR

- [x] 從雲端資料夾下載 3 張 Banner 圖（Drive 需要登入，可能要請你下載後放進 repo；或從 Figma 圖層取原圖）
- [x] 依各斷點更新 Banner 高度（原本 #7 是 `max-height: 675px`、32:15 比例，要重新讀 Figma）
- [x] 隱藏 Banner 上的文字（圖本身有壓字）
- [x] 3 張輪播，每 2 秒切換一張
- [x] 每張加上 #38～#40 的連結

### #28 【首頁】新增說明文字

- Layer：`Index / 2XL > Content > Description / 2XL`
- 留言日期：2026-11-20

> 11/20 新增說明文字

回覆（Ping，2026-11-23）：

> 標題 > 都是英文
> 內文 > 中文版置中對齊，英文版靠左對齊

- [x] 依 Figma 在首頁新增說明文字區塊（Description / 2XL）
- [x] 標題中英文版都用英文
- [x] 內文中文版置中、英文版靠左

### #29 【首頁】影片 iframe 嵌入碼更新

- Layer：`Index / 2XL > Content > Video > Video`
- 留言日期：2026-11-20

> 11/20 更改<iframe>
> Integrate the following code just after the </body> tag:
> `<div id="PPiframe" key="default" banner="true"></div>`
> Integrate the following code just before the </body> tag: `<script async src="https://iframe.patek.com/script.js"></script>`

回覆（Ping）：

> 看不懂她們寫的 🤣

目前程式：`src/pages/index.html` 已經是 `<div id="PPiframe" key="0cd9b5da" lang="en">` 加 `script.js`（修改清單 #54）。

- [x] `PPiframe` 改為 `key="default" banner="true"`
- [x] 確認 `lang` 是否保留、中英文版要不要不同（新嵌入碼沒有 `lang`）
- [x] 原文寫「just after the </body>」應該是筆誤，div 維持放在影片區塊內，script 放在 `</body>` 前
- [ ] 回覆 Ping 說明嵌入碼的意思

## 17. Collection / 2XL（`1032:12300`）

### #42 【時計系列】新增系列

- Layer：`Collection / 2XL > Content > Sort > Collection Card / XL`
- 留言日期：2026-11-23

> 11/20 新增系列

回覆（Ping）：

> 圖檔 >
> https://drive.google.com/drive/u/0/folders/1VoHMUnRmlGb6OFpPaFK5lgVf7ybXgf9a

- [x] 從 Figma 確認新增的是哪個系列、名稱與排序位置
- [x] 下載系列圖檔（同 #41，Drive 需要登入）
- [x] `collection.html` 新增系列卡片（中英文字典一起補）
- [x] 確認是否需要新增對應的單系列列表頁

## 18. About The Boutique / 2XL（`308:151`）

### #30 【精品店】中文標題改為英文

- Layer：`About The Boutique / 2XL > Content > Heading Banner / 2XL`
- 留言日期：2026-11-20

> 11/20 更改中文標題(與英文版本相同)
> Patek Philippe Boutique Taipei by Yung Hsin Watch

- [x] 精品店中文版大標題改為「Patek Philippe Boutique Taipei by Yung Hsin Watch」（和英文版相同，字型可能要改用英文展示字型，看 Figma）

### #43 【精品店】區塊位置對調

- Layer：`About The Boutique / 2XL > Content > Google Map > Map`（pin 在地圖左側）
- 留言日期：2026-11-23

> 11/20 區塊位置對調

- [x] 依 Figma 確認是哪兩個區塊對調（pin 在地圖區，可能是地圖與店家資訊左右對調），再調整 `boutique.html`／`store-locator`

### #31 【精品店】地圖右側資訊

- Layer：`About The Boutique / 2XL > Content > Google Map > Map`（pin 在地圖右側）
- 留言日期：2026-11-20

> 11/20 地圖右側資訊
>
> 1. 營業時間刪除下拉式
> 2. "更多詳情"請改為"路線導航"，連結改連Google Map

回覆（Ping）：

> 營業時間\_中文 >
> 週一至週日 11:00 - 19:00
> (每月第四個星期日公休)

> 營業時間\_英文 >
> Monday to Sunday, 11:00 - 19:00
> **(Closed on the fourth Sunday of each month.)**

- [x] 營業時間拿掉下拉，直接顯示兩行文字（中英文如上，英文第二行看 Figma 是否粗體）
- [x] 「更多詳情」（`store.detail.more`）改為「路線導航」，英文版一併改
- [x] 連結改為 Google Map 路線導航
- [x] 確認其他用到 `store-locator` 的頁面是否一起改

## 19. Our Team_EN（`743:2835`）

### #32 【我們的團隊】小標改為「BOUTIQUE」

- Layer：`Our Team_EN > Content > Heading Banner / 2XL`
- 留言日期：2026-11-20

> 11/20 我們的團隊
> 小標改為「BOUTIQUE」

目前程式：`team.hero.eyebrow` 為「Our Team」。

- [x] 我們的團隊小標改為「BOUTIQUE」（pin 在英文版，中文版 frame 也確認一下是否相同）

## 20. Our Team / 2XL（`455:1394`）

### #44 【我們的團隊】新增內文

- Layer：`Our Team / 2XL > Content > Description / 2XL`
- 留言日期：2026-11-23

> 11/20 新增內文
> 文與圖是從"關於永新"搬過來)

- [x] 在我們的團隊頁新增 Description 區塊，文與圖從關於永新搬過來（和 #46 一起做）
- [x] 英文版一併處理

## 21. About Yung-Hsin / 2XL（`460:1547`）

### #46 【關於永新】更改內文

- Layer：`About Yung-Hsin / 2XL > Content > Description / 2XL`
- 留言日期：2026-11-23

> 11/20 更改內文
> 原本第一段的文與圖搬到"我們的團隊"

- [x] 關於永新頁拿掉原本第一段的文與圖（搬到 #44）
- [x] 依 Figma 更新關於永新的內文
- [x] 英文版一併處理

## 22. Service / 2XL（`462:1686`）

### #36 【維修保養】新增內文

- Layer：`Service / 2XL > Content > Sevice > Description > Text - Large`
- 留言日期：2026-11-20

> 11/20 新增內文

- [x] 依 Figma 在維修保養服務區新增內文（中英文）

### #37 【維修保養】刪除下方標語

- Layer：`Service / 2XL > Content > Sevice`
- 留言日期：2026-11-20

> 11/20 刪除下方標語

回覆（Ping）：

> 「腕錶使用與保養須知」文字大小更改

- [x] 刪除服務區下方的標語
- [x] 「腕錶使用與保養須知」文字大小依 Figma 更新

### #45 【維修保養】標題字級更改

- Layer：`Service / 2XL > Content > FAQ > Title > Title > CH`
- 留言日期：2026-11-23

> 11/20 標題的 font size 有更改

回覆（Ping）：

> 只有維修保養頁更改

- [x] 依 Figma 更新維修保養頁的標題字級（只改這頁，其他頁的同類標題不動；`service.css` 或頁面內 class）

---

# 第三輪：11/24 修改（#47～#54）

- 擷取日期：2026-11-24。範圍是 #46 以後 Ping 的 comment，共 8 則，都沒有回覆，也都還沒 resolve
- 其中 #47、#48 是 11/23 留的，第二輪擷取時漏掉了，一併收在這輪；#49～#54 是 11/24 新增
- `#` 編號：延續第二輪，依建立時間順推，回 Figma 對照時請以留言內容為準
- #48 在 Style Guide 頁（`94:242`）的 Footer frame，其餘在 Mockup 頁（`149:98`）
- 排序和前兩輪一樣，依 frame 在畫布上的位置排，由上到下
- Layer 是用 pin 座標換算到 frame 內的位置比對出來的；「目前程式」是擷取當下對照 repo 的狀態

## 進度總覽（第三輪）

- [x] #48 【全站 Footer】英文版字型全部改為 Inter
- [x] #49 【時計系列】「POCKET WATCHES」改為「Pocket Watches」
- [x] #53 【單系列列表】錶名隱藏「腕錶」（整個頁面）
- [x] #52 【單錶介紹頁】錶名隱藏「腕錶」
- [x] #54 【單錶介紹頁】推薦其他腕錶的錶名隱藏「腕錶」
- [x] #51 【我們的團隊】Description 內文更改
- [x] #50 【我們的團隊】英文版 Description 內文更改
- [x] #47 【關於永新】英文版所有英文靠左對齊

---

## 實作說明（第三輪）

驗證：`npm run check` 通過（66 個測試、26 頁、2012 個本地引用）；Header 用 Playwright 在 1024、1280、1536 寬
中英文實際捲動量測。

- **#48 Footer**：連結列（服務條款／隱私權政策／Cookie 偏好）加 `en:font-label`，英文版改 Inter；
  地址、電話、mail、版權原本就是 Inter。字級 14/22 與中文相同，只換字型。
- **#49 時計系列**：卡片標題寫死在 `collection.html`，改為「Pocket Watches」，中英文共用。
- **#52～#54 拿掉「腕錶」／「WATCH」**：`series.watchName`、`model.recommendWatchName` 中英文都改為
  「GOLDEN ELLIPSE」；單錶頁錶名後的 `model.nameSuffix` span 與字典 key 一起刪除。區塊標題「推薦其他腕錶」、
  頁面 `<title>`／meta description 不在 comment 範圍，維持原樣。
- **#50 #51 我們的團隊 Description**：`team.intro.body` 改用 `data-i18n-html`，第一行 `<strong>` 粗體標題、
  `
` 斷行；英文版內文兩段（Figma 是單純換行，沒有段距）。英文版加 `en:text-left`（Figma EN 靠左），中文維持置中。
  英文照 Figma 用「Yung-Hsin」。
- **#47 關於永新英文版**：四段內文（創辦人、2025 新裝、服務、傳承）加 `en:text-left`；
  Figma 的頁首標題與「Earn trust through integrity…」標題仍置中，所以只改內文。

### 【全站 Header】捲動時換 Logo（使用者 11/24 指示）

參考 https://www.patekboutiquesanfrancisco.com/ ：該站下滑後上排（含大 Logo）捲出畫面，選單列左側的小 Logo
（`.scrollLogo`）以 opacity 淡入。這裡改成：

- 原本置中的 Logo 不再移動縮放到左上角；timeline 前半段（0.5 秒）往上移出 header 並淡出（`autoAlpha`），
  後半段（0.5 秒）在 Figma Header_Scroll 的 Logo 位置淡入另一個 Logo。
  往上滑時 timeline 倒回，順序相反：小 Logo 先淡出，大 Logo 再從上方回來。
- 小 Logo 的位置依 Figma `Header_Scroll / 2XL`（`407:222`）：106×56，在 1280 容器最左邊、88px 列裡垂直置中；
  選單在 Logo 與右側按鈕之間，LG 選單接在 Logo 右側 32px 靠左排（和改動前的收合布局相同）。
  第一版曾把 Logo 貼在「時計系列」左邊、選單維持置中，和設計稿不符，已改回設計稿位置。
- 小 Logo 是 bar 裡獨立的 `a.site-header__scroll-logo`：展開時絕對定位在收合後的位置、`visibility: hidden`，
  不能點也不在無障礙樹裡；收合布局量測時才佔排列位置，header.js 依量測補正位移。行動版不顯示。
- 2XL 量測（含捲軸）：Logo x 120／y 16、選單 433～909、按鈕 1115～1400，與 Figma 的 128、443～915、
  1124～1408 只差捲軸寬度的一半。
- 沒有動畫時（減少動態、GSAP 未載入）捲動後直接隱藏大 Logo、顯示小 Logo。
- `tests/header.test.mjs` 改為檢查換 Logo 的補間（大 Logo 不再有 x／scale，小 Logo 補位移與淡入）。

---

## 23. Style Guide / Footer（`676:4569`）

### #48 【全站 Footer】英文版字型都是 Inter

- Layer：`Footer`（pin 在 frame 下半部，英文版 Footer 附近）
- 留言日期：2026-11-23

> Footer 英文版的字型都是 Inter

目前程式：`src/components/footer/footer.html` 的地址有 `en:type-label-nav-sm`，電話與 mail 已是 `type-label-nav-sm`，
但下方連結列（`ul`）是 `type-body-sm`（Noto Sans TC），英文版沒有切換字型。

- [x] 英文版 Footer 所有文字改用 Inter（逐一檢查地址、電話、mail、連結列、版權），中文版不動
- [x] 實作前讀 Footer_EN 的 font size／line-height，對應既有 `type-label-*` utility

## 24. Collection_EN（`1032:12267`）

### #49 【時計系列】更改文字

- Layer：`Collection_EN > Content > Sort > Collection Card / XL`（第 10 張，Pocket Watches，`1522:13394`）
- 留言日期：2026-11-24

> 11/24 更改文字

Figma 中英文版（`1522:13394`、`1527:9017`）卡片標題都是「Pocket Watches」，和其他系列一樣首字大寫。

目前程式：`src/pages/collection.html` 寫死 `POCKET WATCHES`（全大寫），中英文共用。

- [x] 卡片標題改為「Pocket Watches」（中英文版）

## 25. Series Page / 2XL（`302:185`）

### #53 【單系列列表】隱藏「腕錶」（整個頁面）

- Layer：`Series Page / 2XL > Content > Watch > Watch Card`（第 1 列第 2 張，錶名處）
- 留言日期：2026-11-24

> 11/24 隱藏"腕錶"(整個頁面)

Figma 現在的錶卡只剩型號與「GOLDEN ELLIPSE」。

目前程式：16 張錶卡都用 `series.watchName`，中文「GOLDEN ELLIPSE 腕錶」、英文「GOLDEN ELLIPSE WATCH」。

- [x] 中文 `series.watchName` 拿掉「腕錶」，整頁 16 張卡一起生效
- [x] 英文版的「WATCH」一起拿掉（依你的指示）

## 26. Model Page / 2XL（`313:82`）

### #52 【單錶介紹頁】隱藏「腕錶」

- Layer：`Model Page / 2XL > Content > Top > Watch Info`（型號下方的錶名）
- 留言日期：2026-11-24

> 11/24 隱藏"腕錶"

Figma 現在是「5204G-010」下方只寫「GOLDEN ELLIPSE」。

目前程式：錶名後面接 `model.nameSuffix`（中文「 腕錶」、英文「 WATCH」），
`collection-model.html` 與 `collection-model-2.html` 共用。

- [x] 拿掉錶名後的「腕錶」（`model.nameSuffix`，兩個單錶頁都生效）
- [x] 英文版「WATCH」一起拿掉；頁面 `<title>`／meta description 裡的「腕錶」不在畫面上，先保留

### #54 【單錶介紹頁】推薦錶款隱藏「腕錶」

- Layer：`Model Page / 2XL > Content > Recommend > Watch > Watch Card`（第 2 張，錶名處）
- 留言日期：2026-11-24

> 11/24 隱藏"腕錶"

Figma 推薦區的錶卡錶名只剩「GOLDEN ELLIPSE」；區塊標題「推薦其他腕錶」不變。

目前程式：推薦錶卡用 `model.recommendWatchName`，中文「GOLDEN ELLIPSE 腕錶」、英文「GOLDEN ELLIPSE WATCH」。

- [x] 中文 `model.recommendWatchName` 拿掉「腕錶」
- [x] 英文 `model.recommendWatchName` 一併拿掉「WATCH」

## 27. Our Team_EN（`743:2835`）

### #50 【我們的團隊】英文版更改內容

- Layer：`Our Team_EN > Content > Description / 2XL > Text > EN`（`1522:13997`）
- 留言日期：2026-11-24

> 11/24 更改內容

Figma 新內文（Noto Serif TC 18/32、字距 1px，第一行粗體標題，靠左）：

> **A Castle of Time, Where Heritage and Legacy Endure**
> Since 1995, Yung-Hsin Watch has enjoyed a longstanding partnership with Patek Philippe, built on shared values and a mutual commitment to excellence. In 2004, Yung-Hsin Watch relocated to No. 82, Zhongcheng Road, Tianmu, Taipei, where it established its very own watchmaking castle, reflecting its dedication to cultivating Taiwan’s high-end watch market.
> In 2013, Taiwan’s first Patek Philippe boutique featuring the brand’s new retail concept was inaugurated at this prestigious location. Through its refreshed brand environment, the boutique showcases Patek Philippe’s exceptional watchmaking craftsmanship and enduring spirit of heritage passed down through generations. More than a distinctive symbol of luxury in Tianmu, it also marks an important chapter in the development of Taiwan’s fine watchmaking culture.

目前程式：`team.intro.body`（`src/i18n/en.mjs`）還是「Since 1986, Yung Hsin Watch has established…」的舊文，沒有粗體標題。

- [x] 更新英文 `team.intro.body`：新增粗體標題（改用 `data-i18n-html` 帶 `<strong>`），內文分兩段（用 `\n`）
- [ ] 注意新文用「Yung-Hsin」（有連字號），和網站其他地方的「Yung Hsin」不一致，實作時照 Figma 或先問 Ping

## 28. Our Team / 2XL（`455:1394`）

### #51 【我們的團隊】更改內容

- Layer：`Our Team / 2XL > Content > Description / 2XL > Text > CH`（`1522:13900`）
- 留言日期：2026-11-24

> 11/24 更改內容

Figma 新內文（Noto Serif TC 18/32、字距 1px，第一行粗體標題，置中）：

> **一座鐘錶城堡，承載品牌傳承與時間的故事**
> 永新鐘錶自1995年起與百達翡麗攜手合作，開啟深厚而長遠的夥伴關係。2004年，永新鐘錶遷址至台北天母忠誠路82號，於這座人文薈萃的城市一隅，打造專屬的鐘錶城堡，展現深耕高級鐘錶市場的堅定承諾。2013年，全台首間百達翡麗全新形象專館於此落成，以嶄新的品牌空間，呈現百達翡麗卓越的製錶工藝與世代傳承的品牌精神。不僅成為天母獨具特色的奢華地標，更為台灣高級鐘錶文化寫下重要篇章。

目前程式：`team.intro.body`（`src/i18n/zh.mjs`）還是「永新鐘錶1986 年起深耕台北天母多年…」的舊文。

- [x] 更新中文 `team.intro.body`：新增粗體標題（同 #50 改用 `data-i18n-html`），內文一段
- [x] 依新的文字量對照 Figma 區塊高度（2XL Description 501px）

## 29. About Yung-Hsin_EN（`933:12307`）

### #47 【關於永新】此頁所有英文都靠左對齊

- Layer：`About Yung-Hsin_EN > Content > Description / 2XL`（pin 在第一個 Description）
- 留言日期：2026-11-23

> 11/20
> 此頁所有英文都靠左對齊

目前程式：`src/pages/about.html` 的 Description、兩張 About Card 文字、下方 Description 都是 `text-center`，
英文版沒有切換。

- [x] 英文版整頁內文改靠左（`en:text-left`），中文版維持置中
- [x] 標題（Heading Banner）要不要也靠左，對照 Figma About Yung-Hsin_EN 再決定

---

# 第四輪：11/27 修改（#55～#59）

- 擷取日期：2026-11-27。範圍是 Ping 在 11/27 留的 5 則 comment 加 1 則回覆（台北時間 10:57～11:30），都還沒 resolve
- 同日 Ping 把第一～三輪（11/20 以前）的 comment 都標成已解決
- `#` 編號：延續第三輪，依建立時間順推
- 全部在 Mockup 頁（`149:98`）；Layer 一樣是用 pin 座標換算到 frame 內的位置比對出來的

## 進度總覽（第四輪）

- [x] #55 【我們的團隊】Logo 寬度改為 225px
- [x] #56 【我們的團隊】手機版 Logo 寬度改為 175px
- [x] #57 【我們的團隊】英文版 Description 內文更改
- [x] #58 【關於永新】英文版第一張 About Card 內文更改
- [ ] #59 【首頁】Banner 改為桌機 32:15、手機 9:8，高度隨螢幕縮放（尺寸已改，等新圖）

---

## 實作說明（第四輪）

驗證：`npm run check` 通過；團隊頁 Logo 在 393、1280 寬量測尺寸。

- **#55 #56 團隊頁 Logo**：沿用原本的斷點（XL 以上／以下），XL 以上 225×81、以下 175×63，
  比例與 Figma `Logo / YH` 相同（2XL 225×81、SM 175×63）。Logo 到內文的間距不變（XL 以上 32px、以下 24px，和 Figma 相同）。
- **#57 團隊頁英文內文**：Figma 新版英文是單一段落、**沒有**粗體標題（`1522:13997`，7 行），
  所以英文 `team.intro.body` 拿掉 `<strong>` 標題與換行；中文版維持原樣（comment 註明只改英文）。
- **#58 關於永新英文內文**：`about.renewal.body`（第一張 About Card，2025 新裝）換成 Figma `933:12318` 的新文，縮短為一段。

## 30. Our Team_EN（`743:2835`）

### #55 【我們的團隊】Logo 寬度改為 225px

- Layer：`Our Team_EN > Content > Description / 2XL > Logo / YH`（`1522:14087`，225×81）
- 留言日期：2026-11-27

> 11/27 更改Logo大小
> 寬度 225px

目前程式：`src/pages/team.html` 的 Logo XL 以上 300×109、以下 250×91。

- [x] XL 以上改為 225×81

### #57 【我們的團隊】英文版更改內文

- Layer：`Our Team_EN > Content > Description / 2XL > Text > EN`（`1522:13997`）
- 留言日期：2026-11-27

> 11/27 更改此段內文(只有英文)

Figma 新內文（Noto Serif TC 18/32、字距 1px、靠左，沒有粗體標題）：

> Since 1995, Yung-Hsin Watch has shared a longstanding partnership with Patek Philippe, built on mutual values and a commitment to excellence. In 2004, it relocated to No. 82, Zhongcheng Road, Tianmu, Taipei, establishing its signature watchmaking castle. In 2013, Taiwan’s first Patek Philippe boutique featuring the brand’s new retail concept opened at this location, showcasing the Maison’s exceptional craftsmanship and heritage while marking a significant milestone in Taiwan’s fine watchmaking culture.

- [x] 更新英文 `team.intro.body`，拿掉粗體標題，改為一段

## 31. Our Team / SM（`803:8543`）

### #56 【我們的團隊】手機版 Logo 寬度改為 175px

- Layer：`Our Team / SM > Content > Description / MD > Logo / YH`（`1522:14116`，175×63）
- 留言日期：2026-11-27

> 11/27 更改Logo大小
> 手機版-寬度 175px

- [x] XL 以下改為 175×63

## 32. About Yung-Hsin_EN（`933:12307`）

### #58 【關於永新】英文版更改內文

- Layer：`About Yung-Hsin_EN > Content > Card > About Card > Text > EN`（`933:12318`，第一張卡片）
- 留言日期：2026-11-27

> 11/27 更改此段內文(只有英文)

Figma 新內文：

> In 2025, the Yung Hsin Patek Philippe Boutique unveiled its renewed interior, marking a new chapter in its longstanding partnership with Patek Philippe. Embracing the brand’s latest global design concept, the boutique combines bird’s-eye maple, Indian rosewood, brown marble, and brass accents to create an atmosphere of timeless elegance. Enhanced natural lighting and spacious displays elevate the viewing experience, while the second-floor VIP room offers an intimate and refined European-inspired setting for appreciating fine timepieces.

- [x] 更新英文 `about.renewal.body`

## 33. Index / 2XL（`933:14354`）

### #59 【首頁】Banner 圖片尺寸

- Layer：`Index / 2XL > Banner`（pin 在 Banner 中間）
- 留言日期：2026-11-27

> 11/27 更改 Banner 圖片尺寸(以下是他們會給的圖片尺寸)
> 桌機 - 1920\*900
> 手機 - 900\*800

Ping 回覆：

> 高度全給它 auto 吧，就按照螢幕尺寸縮放

試算表同時要求「首頁橫幅請改回原本的尺寸，更換圖檔已上傳於(修改\_1126檔案夾)，並請提供手機版的橫幅尺寸」
（見 `docs/sheet-revisions.md` 的 2026-11-27 項目）。桌機 1920×900 就是 32:15，和 11/20 以前的 LG 比例相同。

目前程式：`src/pages/index.html` 的 Banner 是 16:9（2XL 1536:800），三張圖都是 2400×1350。

- [x] 容器比例改為 MD（768px）以上 32:15、以下 9:8，高度隨寬度等比縮放（2026-11-27，依使用者指示先改尺寸）
- [ ] 拿到新圖後換圖，手機與桌機各放一張（builder 目前不改寫 `srcset`，要嘛補上支援，要嘛放兩個 `<img>` 依斷點顯示）
- 暫時沿用 16:9 舊圖：桌機上下各裁約 8%，手機左右各裁約 18%，壓在圖上的字會被切到
- [ ] 新圖在 Google 雲端「修改\_1126」資料夾，本機還沒有，要先取得
