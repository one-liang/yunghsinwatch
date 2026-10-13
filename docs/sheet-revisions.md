# 永新鐘錶修改清單（Google 試算表）

- 來源：[永新鐘錶\_修改 / 工作表1](https://docs.google.com/spreadsheets/d/17R5KGBXLNXc-hmn-yyKfb1b5CzN6x_aYN4tVvrNLiwM/edit?gid=0#gid=0)
- 擷取日期：2026-10-13（第 2～21 列，共 19 筆有內容；第 21 列只填了語系，第 22～35 列只有編號）
- 「修改內容」以引言照錄，錯字（Navbra、設計搞）也照錄；「截圖/連結」欄的超連結一併附上
- 「處理狀況」欄的下拉選項為「已處理／驗證完畢」，「阿良」「一瓶」兩欄，擷取時全部空白
- `#` 依列順序重新編號（= 試算表列號 − 1）。試算表的編號欄有空白與重複（第 6、10、13、14、16、17 列），
  不一致的地方在小節標題後註明試算表原本的編號，方便對照
- 排序：沿用試算表順序，依「修改頁面」分節

完成後把 `- [ ]` 改成 `- [x]`。

## 進度總覽

- [x] #1 【Header】「ZH」改為「中文」
- [x] #2 【Header】品牌專賣店子選單位置
- [x] #3 【Header】1534px 以下 Navbar 下滑時高度被截掉
- [x] #4 【Header】LG 店名字型大小
- [x] #5 【Header】MD、SM 店名字型大小
- [x] #6 【Footer】PP Logo 變形
- [x] #7 【Footer】地址與電話改為 `<p>` 並移除 hover
- [x] #8 【Footer】FB 與 IG Logo 消失
- [x] #9 【Footer】英文地址刪除「(next to First Bank)」
- [x] #10 【Footer】版權文字字型改為 Inter
- [ ] #11 【首頁】Banner 輪播第二張照片更換
- [ ] #12 【首頁】Banner 輪播文字區塊 `left-32` 改為 `left-12`
- [ ] #13 【首頁】Banner 輪播文字區塊寬高與字型大小
- [ ] #14 【首頁】YouTube 影片播放器設定
- [ ] #15 【首頁】圖文卡片標題字重 500 改為 600
- [ ] #16 【首頁】圖文卡片 `gap-4` 改為 `gap-3`
- [ ] #17 【首頁】圖文卡片與聯絡我們加連結與 hover 放大
- [ ] #18 【首頁】英文版 Contact Us 字型
- [ ] #19 【首頁】英文版「Make an Appointment」改為「BOOKING」

---

## 1. Header

### #1 【Header】「ZH」改為「中文」

- 語系：中文、EN
- 設計稿：[Header_st2 / 2XL](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=965-12376)（`965:12376`）

> 「ZH」改為「中文」

- [x] 語系切換的「ZH」改為「中文」

實作說明：依 Figma `Language` 內的文字（`I965:12376;961:11199;384:317`），「中文」為 Noto Sans TC Regular
16/28、字距 1px（Body/Base），所以 zh 連結由 `type-label-lang-md tracking-[1.5px]`（Inter Medium）改為
`type-body-base tracking-[1px]`；「EN」在 Figma 仍是 Inter Medium 16/28、字距 1.5px，維持不變。
`lang.zh` 在中英文字典都改成「中文」，英文版頁面也顯示「中文」；桌機 Header 與手機抽屜一起修改，Footer 沒有語系切換。

另外發現的既有問題（當時未修改，已在「補充：未捲動時一律顯示店名」一併修正）：LG（1024～1279px）的語系連結
左右 padding 會縮成 1rem，但 `.site-header__lang-link::after` 寫在 LG media query 之後、權重相同，蓋掉了
media query 裡的 `left/right: 1rem`，所以首頁等頁面在 LG 尺寸下，目前語系的底線比文字短（「EN」只剩約 9px）。
現在底線的左右位置跟著連結內距的 CSS 變數走，各斷點、展開與捲動後量到的底線寬度都等於文字寬度。

### #2 【Header】品牌專賣店子選單位置

- 語系：中文、EN
- 設計稿：[Group](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=965-12344)（`965:12344`，Header_st2 / 2XL 加 Sub Menu `1069:8881`）

> 品牌專賣店 > 子選單(submenu)
> 位置要在整塊Navbra的下方，參考設計稿

- [x] 「品牌專賣店」的子選單改為出現在整塊 Navbar 的下方（依設計稿）

實作說明：Figma 的 Sub Menu 頂端（y 171.6）就是 Header 底緣（高 172），原本程式是接在按鈕底下（`top-full`），
展開時離底緣差 4px，捲動縮合後差 18px，子選單會疊在黑色 Header 上。`header.js` 改成量測子選單 li 頂端到
`.site-header__background` 底緣的距離，寫進 CSS 變數 `--site-header-submenu-top`，`header.css` 用它當子選單的 `top`。
捲動縮合時 nav 位移和背景縮放都是線性補間，兩者的距離也隨進度線性變化，所以把這個變數加進同一條 GSAP timeline
從 56px 補間到 70px，動畫過程中子選單也一直貼著背景底緣（量測每幀誤差 < 0.05px）。沒有 timeline 時（減少動態、
GSAP 未載入）依目前布局直接量測，捲動切換狀態時再量一次。按鈕和子選單之間的空隙補了一塊透明的 hover 區
（`.site-header__dropdown::after`，只在展開時出現），滑鼠往下移時子選單不會消失。`tests/header.test.mjs` 補了
timeline、靜態布局與 CSS 的測試。

CSS 的 `top` 用 `max(100%, …)`，背景底緣若高於按鈕，子選單最高只到按鈕底緣，不會蓋住按鈕。
實作 #2 時發現的時計系列三頁背景縮成 45px，就是 #3，已一併修正。

另外發現的既有問題（未修改）：子選單寬度 Figma 為 156px（和按鈕同寬），程式因左右 padding 40px
加上「我們的團隊」的字寬是 167.5px，比按鈕寬 10px。

### #3 【Header】1534px 以下 Navbar 下滑時高度被截掉

- 語系：中文、EN
- 截圖：[1-1.jpg](https://drive.google.com/file/d/1WL1L6Lvk3t1UYjw2MrzDYpc4MYlakv-r/view?usp=sharing)

> 螢幕尺寸1534px以下 >
> Navbra下滑時高度被截掉

- [x] 修正螢幕寬度 1534px 以下，Navbar 下滑時高度被截掉

實作說明：截圖是時計系列頁（`collection.html`）在 1534px、往下捲動後的畫面。時計系列、單系列列表、單錶介紹頁在
1024～1535px 依 Figma 使用 88px 的精簡 Header（各頁 sidecar CSS 覆寫），但 `header.js` 的 timeline 不論頁首高度，
都把黑色背景縮成 `88 / 172`，88px 的背景就只剩 45px。下半截的白色導覽文字、Logo 與預約按鈕落在白底上，看起來像被截掉。
其他頁在 LG 以上都是 172px 的完整頁首，縮成 88px 剛好，所以只有這三頁有問題；1536px 以上三頁也改回完整頁首，
同樣正常。

修正方式：`header.css` 的收合狀態（端點量測與沒有 GSAP 時的 fallback）改用 `height: 88px` 決定背景高度，
不再用 `scaleY(88 / 172)`。`header.js` 在端點量測時讀取背景展開與收合的實際高度，用兩者的比例當 timeline 的
`scaleY`：完整頁首仍是 88 / 172，精簡頁首為 1、不縮放。`tests/header.test.mjs` 補了兩種頁首的比例測試與 CSS 測試。

驗證：用 `dist/` 預覽（Playwright 不允許開 `file://`，dist 都是相對路徑，載入的是同一份檔案）。
三個時計系列頁、首頁、中英文版，在 1024／1280／1534／1536px 各捲動一次，另外首頁與時計系列頁也在
減少動態模式下測試，共 32 種組合。捲動前後與動畫過程中，黑色背景都完整包住 Logo、導覽列與按鈕，子選單也都貼齊背景底緣。

後續：三頁的 88px 精簡 Header 已在「補充：未捲動時一律顯示店名」拿掉，現在全站都是 172px 展開、捲動後收成 88px。
依量測高度計算縮放比例的寫法保留，展開高度不是 172px 時也不會縮錯。

### #4 【Header】LG 店名字型大小

- 語系：中文、EN
- 設計稿：[Header_st2 / 2XL（LG 寬 1024）](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=961-11617)（`961:11617`）

> 螢幕尺寸LG >
> 「永新鐘錶百達翡麗專賣店」font-size:22px，line-height:32

- [x] LG：「永新鐘錶百達翡麗專賣店」改為 font-size 22px、line-height 32（px）

### #5 【Header】MD、SM 店名字型大小（試算表編號空白）

- 語系：中文、EN
- 設計稿：[Navigation（MD 寬 768）](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=757-4024)（`757:4024`）

> 螢幕尺寸MD&SM >
> 「永新鐘錶百達翡麗專賣店」font-size:14px，line-height:20

- [x] MD、SM：「永新鐘錶百達翡麗專賣店」改為 font-size 14px、line-height 20（px）

實作說明（#4、#5）：依 Figma 各斷點的店名文字節點，中文皆為 Noto Serif TC Medium、字距 1px：

| 斷點                   | 中文（Figma 節點）                     | 英文（同元件中隱藏的英文圖層）                 | 原本程式               |
| ---------------------- | -------------------------------------- | ---------------------------------------------- | ---------------------- |
| MD、SM（1023px 以下）  | 14/20（`1036:9281`）                   | Playfair Display Medium 14/24（`1036:9282`）   | 中文 16/24、英文 16/24 |
| LG（1024～1279px）     | 22/32（`I961:11617;960:11095`）        | Playfair Display Medium 22/32（`…;960:11130`） | 中文 28/40、英文 22/32 |
| XL 以上（1280px 以上） | 2XL 為 28/40（`I965:12376;960:11095`） | 22/32                                          | 不變                   |

Figma 的 Index / XL（`1088:9597`）用的是 88px 的 Header_Scroll，沒有店名，所以 XL 不改，維持 2XL 的 28/40。
這兩組值不在現有的 `type-heading-*` 級距裡，`tailwind.css` 比照 `type-label-nav-*` 新增店名專用的
`type-heading-brand-lg`（22/32）與 `type-heading-brand-sm`（14/20）。英文 MD／SM 原本的 `type-display-xs` 是
「Figma 未定義、暫用 16/24」的暫定值，只有店名在用，依隱藏的英文圖層改為 14/24。原本靠 `lg:type-heading-md` 讓
LG 以上都是 28/40，現在拆成 `lg:` 22/32、`xl:` 28/40，英文版另外補上 `xl:en:type-display-sm`，避免在 XL
被中文的 `xl:type-heading-md` 蓋掉。

驗證：在 390／768／1023／1024／1279／1280／1535／1536px 量測中英文首頁的店名，字型、字重、字級、行高、字距都與上表相同；
中文文字框 MD 為 165×20、LG 為 253×32、2XL 為 319×40（Figma 164×20、252×32、318×40）。

待確認：英文是以中文設計稿裡隱藏的英文圖層為準。390px 時英文店名第一行會折成兩行，共 3 行（72px），
比 68px 的手機版 Header 略高，這在修改前（16px）就是這樣，Figma 沒有 SM 的英文版可以對照。

### 補充：未捲動時一律顯示店名（不在試算表，2026-10-13 直接需求）

- 語系：中文、EN
- 設計稿：展開 [2XL](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=407-223)（`407:223`）、
  [XL](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=933-14525)（`933:14525`）、
  [LG](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=961-11617)（`961:11617`）、
  [MD & SM](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=757-4024)（`757:4024`）；
  捲動後 [Navbar-Scroll](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=676-4122)（`676:4122`，
  2XL `407:222`、XL `957:9774`、LG `957:9874`）

> Header 沒有照設計稿樣式，在還沒滑動時，「永新鐘錶百達翡麗專賣店」文字都要顯示

- [x] 時計系列、單系列列表、單錶介紹頁在 1024～1535px 未捲動時也顯示店名
- [x] LG 展開時的選單、語系、預約按鈕間距改回 Header_st2 的數值
- [x] 捲動後的間距改依各斷點的 Header_Scroll
- [x] 選單列位置對齊 Figma（往上 4px）
- [x] 桌機預約按鈕高度改為 Figma 的 46px

實作說明：用 headless Chrome 以 `file://` 開 `dist/` 的 11 頁中英文版，在 390～1920px 共 8 種寬度量測，只有
時計系列三頁在 1024～1535px 看不到店名：這三頁的 sidecar CSS（`collection.css`、`collection-series.css`、
`collection-model.css`）在這個範圍改用 88px 的精簡 Header，把店名設成 `display: none`。三段覆寫都已移除
（`collection.css` 只有這段，整個刪掉），改用全站共用的 Header：172px 展開、捲動後收成 88px。

順便對照各斷點的座標，另外修正以下幾處：

| 項目                      | Figma                                                              | 原本程式                              |
| ------------------------- | ------------------------------------------------------------------ | ------------------------------------- |
| LG 展開（1024～1279px）   | 選單、語系左右 24px，按鈕 16px，語系與按鈕間距 40px（同 2XL）      | 選單、語系 16px，按鈕 8px             |
| LG 捲動後                 | 選單、語系 16px，按鈕 8px，間距 16px；選單接在 Logo 右側 32px 靠左 | 間距 40px，選單在 Logo 與右側之間置中 |
| XL 捲動後（1280～1535px） | 語系與按鈕間距 24px                                                | 40px                                  |
| 選單列頂端（展開）        | 112px（Header_st2 上排 Navigation 高 112）                         | 116px                                 |

LG 的 16px／8px 原本只用在捲動後；改成以 transform 補間的收合動畫時，因為 transform 不能改內距，就變成展開時也套用。
現在這三個值改成 `header.css` 的 CSS 變數（`--site-header-link-px`、`--site-header-cta-px`、`--site-header-actions-gap`），
展開值依 Header_st2，收合值依各斷點的 Header_Scroll。`header.js` 在同一條 timeline 補間這些變數，另外量一次「展開布局＋收合間距」
（`is-measuring-spacing`），transform 只補從這個狀態到收合布局的差。兩者相加，動畫中每個元素都線性移到收合位置。
語系底線改用同一個變數定位，#1 提到的 LG 底線過短也一併修正。`tests/header.test.mjs` 補了間距補間、CSS 數值，
以及「頁面 CSS 不得覆寫 Header」的測試。

驗證：

- 11 頁 × 中英文 × 8 種寬度（390／768／1024／1279／1280／1535／1536／1920px）共 176 種組合，未捲動時店名都顯示，
  沒有和選單、右側按鈕重疊，也沒有水平捲軸。
- 1024／1280／1536px 展開與捲動後，Logo、店名、選單、語系、預約按鈕的位置和 Figma 差 0～3px。
  差距來自每個選單項目的文字比 Figma 寬約 1px。
- 動畫逐幀取樣：同一幀裡各選單項目、按鈕位置與寬度的進度一致（差 < 1%），子選單一直貼齊背景底緣（0px）。
  回到頂端後與初始狀態完全相同。
- 減少動態模式下，捲動後的靜態收合版面和動畫終點相同。

預約按鈕在 Figma 是 46px 高，框線畫在內側、不佔高度；程式的 `border` 會加在外側，原本是 48px。
桌機按鈕的上下內距改成 11px（加上 1px 框線等於 Figma 的 12px），高度改為 46px。手機抽屜的按鈕沒有改。
寬度 Figma 為 91px（文字框固定 59px），程式依實際字寬為 90px，沒有另外調整。

## 2. Footer

### #6 【Footer】PP Logo 變形

- 語系：中文、EN
- 設計稿：[Footer_st2 /2XL](https://www.figma.com/design/8SNUs9FJPBfLP5ZC8gkUQS/?node-id=970-13179)（`970:13179`）；
  另對照首頁的 Footer_st2 / XL（`1088:11787`）、/ LG（`1088:10938`）、/ MD（`1088:12054`，寬 393）

> PP Logo變形

- [x] 修正 PP Logo 變形

實作說明：Logo SVG 是 Figma 匯出的，根節點帶 `preserveAspectRatio="none"`，`<img>` 的寬高比只要和 viewBox 不同就會被拉伸。
PP Logo 的 viewBox 是 638×338（1.888），Footer 卻設成 SM 120×74、LG 以上 140×87（約 1.62），所以被橫向擠扁。
依 Figma 改為 SM／MD 120×64（`h-16 w-[120px]`）、LG 以上 140×74（`lg:h-[74px] lg:w-[140px]`），比例皆 1.88～1.89。
YH Logo（160×76、176×84）和 Header 的 PP Logo（83×44、140×74、捲動後 106×56）比例原本就正確，不用改。

驗證：在 393／640／768／1023／1024／1280／1536px 量測中文首頁與英文聯絡我們頁，Footer 的 PP Logo 都是上述尺寸，截圖和 Figma 一致。

### #7 【Footer】地址與電話改為 `<p>` 並移除 hover

- 語系：中文、EN

> 地址與電話`<a>`改為`<p>`就好，以及刪除hover效果

- [x] 地址與電話由 `<a>` 改為 `<p>`
- [x] 移除地址與電話的 hover 效果

實作說明：地址原本連到 Google 地圖（另開分頁）、電話是 `tel:` 連結，兩者都改成 `<p>`，連同 hover／focus 變金色的樣式一起拿掉。
試算表只提到地址與電話，所以信箱維持 `mailto:` 連結與 hover。

### #8 【Footer】FB 與 IG Logo 消失

- 語系：中文、EN

> FB與IG LOGO消失

- [x] 修正 FB 與 IG Logo 消失

實作說明：問題只在用 `file://` 直接開啟 dist（例如 `dist/collection.html`）時出現。Footer 的五個圖示（地址、電話、信箱、
Instagram、Facebook）原本是 `footer.css` 用 CSS `mask-image` 載入 `assets/icons/*.svg` 再塗上 `currentColor`。
Chrome 會以 CORS 模式抓 mask 圖檔，而 `file://` 不支援 CORS，console 出現五筆
「Access to image at 'file:///…/dist/assets/icons/instagram.svg' from origin 'null' has been blocked by CORS policy」，圖示就變成空白。
用 http（dev server、preview、GitHub Pages）開啟時不會發生，所以先前沒發現；地址、電話、信箱的圖示其實也一起消失了。

修正方式：五個圖示改成直接寫在 `footer.html` 的 inline SVG（path 取自原本的 `assets/icons/*.svg`，`fill="currentColor"`），
信箱與 IG、FB 的 hover 變金色照舊；`footer.css` 只剩這些 mask 規則，已整個刪除。

驗證：用 headless Chrome 以 `file://` 開啟打包後的 `dist/collection.html`（1536、393px）與 `dist/en/index.html`（1024px），
修改前 console 有上述 5 筆 CORS 錯誤、修改後 0 筆，截圖中五個圖示都正常顯示。`npm run check` 的本地引用數由 1666 降為 1446
（22 頁 × 每頁 10 個 mask URL）。

### #9 【Footer】英文地址刪除「(next to First Bank)」（試算表編號 8，與上一列重複）

- 語系：EN

> 英文地址刪除 (next to First Bank)

- [x] 英文版地址刪除「(next to First Bank)」

實作說明：`en.mjs` 的 `footer.address` 改為「No. 82, Sec. 1, Zhongcheng Rd., Shilin Dist., Taipei City」，全站只有 Footer 用到這句。
中文地址的「(第一銀行旁)」試算表沒有要求，維持不變。

另外發現的既有問題（未修改）：英文版在 LG（1024～1279px）時地址欄只剩約 154px 寬，地址折成 3 行（刪字前是 4 行）。
原因是 Logo 區塊在所有斷點都固定 398.24px 寬（Figma SM 的 Logo frame 寬度），Figma LG／XL／2XL 的 Logo frame 是 360px，
再加上英文的「TERMS OF SERVICE • PRIVACY POLICY」比中文長，把中間的聯絡資訊擠窄了。

### #10 【Footer】版權文字字型改為 Inter

- 語系：中文、EN

> © 2026 Yung Hsin Watch All rights reserved.
> 字型改為Inter

- [x] 版權文字字型改為 Inter

實作說明：Figma 中英文 Footer 的 Copyright 都是 Inter Regular 12/20、Brown/Warm #8C7A66。原本是 `type-body-xs`（Noto Sans TC 12/20），
只有英文版靠 `en:font-label` 換成 Inter。`tailwind.css` 新增 `type-label-copyright`（Inter 12/20），中英文都改用它；
量測各斷點中英文首頁皆為 Inter 400 12px／20px。

備註：版權文字的內容已在 Figma comment #23 改成上述文字（見 `figma-mockup-comments.md`），本項只改字型。

## 3. 1-首頁

### #11 【首頁】Banner 輪播第二張照片更換

- 語系：中文（內文寫英文版也要一起改）
- 連結：[1-首頁](https://drive.google.com/drive/u/0/folders/1sP37T8VEUHDVfMTXBEoxekvsR9yvQgtR)（雲端資料夾）

> Banner輪播 >
> 更換第二張照片(雲端1-2.jpeg)，英文版也一樣，英文文字參考設計稿

- [ ] Banner 輪播第二張改用雲端的 1-2.jpeg（中英文版都換）
- [ ] 英文版第二張的文字依設計稿更新

### #12 【首頁】Banner 輪播文字區塊 `left-32` 改為 `left-12`（試算表編號 11，與上一列重複）

- 語系：中文、EN

> Banner輪播 >
> 文字區塊`<div>`left-32改為left-12

- [ ] Banner 輪播文字區塊 `<div>` 的 `left-32` 改為 `left-12`

### #13 【首頁】Banner 輪播文字區塊寬高與字型大小（試算表編號 12）

- 語系：中文、EN

> 螢幕尺寸LG + MD&SM >
> Banner輪播的文字區塊的寬度高度有變更，以及文字字型大小，參考設計搞

- [ ] LG、MD、SM：依設計稿更新 Banner 輪播文字區塊的寬度與高度
- [ ] LG、MD、SM：依設計稿更新 Banner 輪播文字的字型大小

### #14 【首頁】YouTube 影片播放器設定

- 語系：中文

> Youtube影片
> 影片播放器設定錯誤?

- [ ] 確認 YouTube 影片播放器的設定錯誤是指什麼（原文是問句），再修正

### #15 【首頁】圖文卡片標題字重 500 改為 600（試算表編號 14，與上一列重複）

- 語系：中文、EN

> 圖文卡片 >
> 標題`<h2>`font-weight:500改為font-weight:600
> (@font-face要再新增一個)

- [ ] 圖文卡片標題 `<h2>` 由 font-weight 500 改為 600
- [ ] 新增 600 字重的 `@font-face`

### #16 【首頁】圖文卡片 `gap-4` 改為 `gap-3`（試算表編號 15；修改頁面、語系欄空白）

- 語系：試算表空白

> 圖文卡片 >
> `<article>`裡面`<div>`gap-4改為gap-3

- [ ] 圖文卡片 `<article>` 內 `<div>` 的 `gap-4` 改為 `gap-3`

備註：修改頁面欄空白，因內容接在 #15 的圖文卡片之後，先歸在首頁。

### #17 【首頁】圖文卡片與聯絡我們加連結與 hover 放大

- 語系：中文、EN
- 參考：https://www.furlanmarri.com/ （MEET OUR BESTSELLERS 區塊）

> 圖文卡片與聯絡我們 >
> 區塊需要放連結，以及hover時底圖可以放大，參考連結(MEET OUR BESTSELLERS區塊)

- [ ] 圖文卡片與聯絡我們區塊加上連結
- [ ] hover 時底圖放大，效果參考 furlanmarri.com 的 MEET OUR BESTSELLERS 區塊

備註：Figma comment #9 已做過首頁文章卡片的圖片 hover 放大，可能和本項的圖文卡片重疊，要確認範圍。

### #18 【首頁】英文版 Contact Us 字型

- 語系：EN

> Contact Us
> 標題字型為Playfair Display，內文字型為Inter

- [ ] 英文版 Contact Us 區塊標題改用 Playfair Display
- [ ] 英文版 Contact Us 區塊內文改用 Inter

### #19 【首頁】英文版「Make an Appointment」改為「BOOKING」

- 語系：EN

> 「Make an Appointment」改為「BOOKING」
> 字型改為Playfair Display

- [ ] 英文版「Make an Appointment」改為「BOOKING」
- [ ] 字型改為 Playfair Display

備註：精品店頁的 `boutique.appointment.title` 也是「Make an Appointment」，試算表只列了首頁。

## 未收錄的列

- 第 21 列（#20）：語系欄填「中文, EN」，其他欄空白
- 第 22～35 列（#21～#34）：只有編號
