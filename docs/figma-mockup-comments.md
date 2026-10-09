# Figma Mockup Comment 待辦清單

- 來源：[百達翡麗專賣店\_官方網站 / Mockup](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=149-98)（頁面 `149:98`）
- 擷取日期：#2～#15 於 2026-10-05 擷取（14 則 comment + 3 則回覆），#16～#21 於 2026-10-08 擷取（6 則 comment + 1 則回覆），作者皆為 Ping
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
- [x] #4 【關於永新】進站 Scroll 動畫
- [x] #13 【維修保養】進站 Scroll 動畫
- [x] #20 【聯絡我們】欄位改為「居住國家/地區」
- [x] #21 【聯絡我們】送出完成畫面標題與文字

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

## 4. Index / XL（`1088:9597`）

### #15 【Header】MD / LG 尺寸使用 scroll 版 Header

- Layer：`Index / XL > Header_Scroll / 2XL > Navigation > Menu / 2XL > Menu List / 2XL`
- 留言日期：2026-09-21

> 因為我懶得改了 🤣，所以 MD 與 LG 尺寸，我都直接放 scroll 的 Header

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

- [ ] 回覆 Ping 是否能用第二款嵌入樣式
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
