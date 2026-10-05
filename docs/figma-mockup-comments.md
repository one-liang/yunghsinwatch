# Figma Mockup Comment 待辦清單

- 來源：[百達翡麗專賣店\_官方網站 / Mockup](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=149-98)（頁面 `149:98`）
- 擷取日期：2026-10-05，共 14 則 comment + 3 則回覆，作者皆為 Ping
- 排序：依 frame 在畫布上的位置（由上到下、由左到右），同一 frame 內依 pin 由上到下
- `#` 為 Figma comment 的 order id，方便回 Figma 對照
- Layer 路徑是用 comment pin 座標比對出的最深 layer（Figma 只把 comment 綁在頂層 frame），僅供定位參考

完成後把 `- [ ]` 改成 `- [x]`。

## 進度總覽

- [x] #8 【全站】按鈕 Hover 效果
- [ ] #14 【Header】切換 Header 時由上往下展開
- [x] #7 【首頁】Banner 高度與影片
- [x] #6 【首頁】Scroll 動畫
- [ ] #9 【首頁、時計系列】卡片圖片 Hover 放大
- [ ] #15 【Header】MD / LG 尺寸使用 scroll 版 Header
- [ ] #10 【單系列列表、單錶介紹頁】手錶名稱 Hover 效果
- [x] #12 【單系列列表、單錶介紹頁】Scroll 動畫
- [x] #11 【精品店】進站 Scroll 動畫
- [ ] #5 【精品店】圖片輪播
- [ ] #2 【精品店】Google 地圖嵌入
- [x] #3 【我們的團隊】進站 Scroll 動畫
- [x] #4 【關於永新】進站 Scroll 動畫
- [x] #13 【維修保養】進站 Scroll 動畫

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

- [ ] 文章卡片圖片 Hover 放大
- [ ] 系列卡片圖片 Hover 放大

## 4. Index / XL（`1088:9597`）

### #15 【Header】MD / LG 尺寸使用 scroll 版 Header

- Layer：`Index / XL > Header_Scroll / 2XL > Navigation > Menu / 2XL > Menu List / 2XL`
- 留言日期：2026-09-21

> 因為我懶得改了 🤣，所以 MD 與 LG 尺寸，我都直接放 scroll 的 Header

- [ ] MD、LG 尺寸直接使用 scroll 版 Header

## 5. Series Page / 2XL（`302:185`）

### #10 【單系列列表、單錶介紹頁】手錶名稱 Hover 效果

- Layer：`Series Page / 2XL > Content > Watch > Watch Card > Text > Name > CH`
- 留言日期：2026-09-21

> 【單系列列表、單錶介紹頁】
> 單錶卡片的手錶名稱新增 Hover 效果
> `decoration-solid`

- [ ] 單錶卡片手錶名稱 Hover 底線（`decoration-solid`）

### #12 【單系列列表、單錶介紹頁】Scroll 動畫

- Layer：`Series Page / 2XL > Content > Recommend > Title > Title > CH`
- 留言日期：2026-09-21

> 【單系列列表、單錶介紹頁】
> scroll 時下方內容的 Animation
> 📌 參考網站：https://www.furlanmarri.com/

- [x] 單系列列表頁 scroll 進場動畫
- [x] 單錶介紹頁 scroll 進場動畫

## 6. About The Boutique / 2XL（`308:151`）

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

- [ ] 精品店圖片輪播

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

## 7. Our Team / 2XL（`455:1394`）

### #3 【我們的團隊】進站 Scroll 動畫

- Layer：`Our Team / 2XL > Content > Card > Member Card / 2XL > Left_img`
- 留言日期：2026-08-21

> 【我們的團隊】
> 一進站 scroll 時下方內容的 Animation
> 📌 參考網站：https://www.furlanmarri.com/

- [x] 我們的團隊頁 scroll 進場動畫

## 8. About Yung-Hsin / 2XL（`460:1547`）

### #4 【關於永新】進站 Scroll 動畫

- Layer：`About Yung-Hsin / 2XL > Content > Description / 2XL`
- 留言日期：2026-08-21

> 【關於永新】
> 一進站 scroll 時下方內容的 Animation
> 📌 參考網站：https://www.furlanmarri.com/

- [x] 關於永新頁 scroll 進場動畫

## 9. Service / 2XL（`462:1686`）

### #13 【維修保養】進站 Scroll 動畫

- Layer：`Service / 2XL > Content > Sevice > Card > Service Card > IMG`
- 留言日期：2026-09-21

> 【維修保養】
> 一進站 scroll 時下方內容的 Animation
> 📌 參考網站：https://www.furlanmarri.com/

- [x] 維修保養頁 scroll 進場動畫

實作說明：#3、#4、#11、#12、#13 與 #6 共用同一套 `data-reveal-group`／`data-reveal-media` 進場動畫；
舊的 `data-reveal`（側邊滑入、2 秒）已全站移除。
