# 現場點餐系統 - 進度追蹤

## Session: 2026-02-21 (2) - UI Iteration Wave 12~13 + Bug fixes + 圓形按鈕陰影修正

> 分支：`feat/ui-iteration-2`（未合併至 main）

### 之前 session 已完成（本分支上）
- [x] Wave 1~11：UI 精緻化系列（去 AI 味、深色主題、動效增強、便利功能、一致性清掃等）
- [x] Wave 12 (c1af689): 替換所有 6 個原生 `confirm()` 為自定義深色主題確認對話框 (ConfirmDialog)
- [x] Wave 13 (c077953): 修復硬編碼字串 + 低庫存脈動動畫 + 設定標籤去重
- [x] Bug fix (b812673): 修復分類標籤切換時卡片標題被遮擋的問題（sticky positioning bug）

### 本次 session 完成
- [x] 調查菜單 + 按鈕看起來不圓的問題（使用 Playwright 瀏覽器截圖調查）
- [x] 診斷出 `woodblock-shadow-accent`（`3px 3px 0 0` 硬邊偏移陰影）讓 `rounded-full` 按鈕看起來不圓
- [x] 修正 MenuItemCard.tsx：將 `woodblock-shadow-accent` 改為柔和圓形擴散陰影 `shadow-[0_2px_6px_rgba(194,54,22,0.4)]`

### 修改檔案
- `src/components/customer/MenuItemCard.tsx` - + 按鈕陰影從硬邊偏移改為柔和擴散（**未 commit**）

### 待繼續的 UI 迭代項目
- **Phase 2 HIGH**: KitchenLogin 加 loading state、破壞性操作後加 success toast、修復 focus indicators
- **Phase 3 MEDIUM**: 可重用 form state utilities、語言切換按鈕、訂單取消 undo
- ConnectionStatus.tsx 硬編碼錯誤字串 ('Failed to start host', 'Failed to connect')
- 小圖示按鈕觸控目標改善

### Commits（本分支累積，非本次 session）
- `532b51f` ~ `c077953` — Wave 1~13 共 13 個 commit
- 本次修改尚未 commit

### 5-Question Reboot Check
1. **做什麼？** `feat/ui-iteration-2` 分支上的 UI 迭代，本次修正菜單 + 按鈕的圓形陰影問題
2. **進度？** 陰影修正已完成但未 commit；整個 UI 迭代分支仍有 Phase 2/3 項目待完成
3. **下一步？** (1) commit 當前 MenuItemCard.tsx 修改 (2) Phase 2 HIGH 項目：KitchenLogin loading state、success toast、focus indicators (3) ConnectionStatus 硬編碼字串修復
4. **阻礙？** 無技術阻礙；分支尚未合併至 main
5. **檔案？** `src/components/customer/MenuItemCard.tsx`（未 commit 修改）、`src/components/kitchen/KitchenLogin.tsx`（Phase 2 loading state）、`src/components/shared/ConnectionStatus.tsx`（硬編碼字串）

---

## Session: 2026-02-21 - PWA 圖示生成 + CSP Headers + 測試指引

### 完成項目
- [x] PWA 圖示生成：用 sharp 從 `public/favicon.svg` 生成 4 個 PNG（icon-512.png、icon-192.png、apple-touch-icon.png、icon-maskable-512.png）
- [x] 更新 vite.config.ts manifest 的 maskable 條目指向專用 `icon-maskable-512.png`
- [x] CSP Headers：在 4 個 HTML（index/customer/kitchen/queue）加入 `<meta http-equiv="Content-Security-Policy">`
- [x] CSP 策略允許 Google Fonts、PeerJS 信令伺服器（0.peerjs.com）、SVG data URI、PWA Service Worker
- [x] 建立 TESTING.md：P2P 多設備同步測試指引（BroadcastChannel、PeerJS、離線重連、密碼相容性、CSP 驗證）
- [x] 更新 git remote URL 到 `https://github.com/0908869905/ordering-system.git`
- [x] `npm run build` 通過（零錯誤）
- [x] 已 push 到遠端

### 修改檔案
- `public/icons/icon-512.png` - 新建：512x512 PWA 圖示（從 favicon.svg 生成）
- `public/icons/icon-192.png` - 新建：192x192 PWA 圖示
- `public/apple-touch-icon.png` - 新建：180x180 Apple Touch 圖示
- `public/icons/icon-maskable-512.png` - 新建：512x512 Maskable 圖示（含安全區域 padding）
- `vite.config.ts` - PWA manifest maskable icon 條目改指向 `icon-maskable-512.png`
- `index.html` - 加入 CSP meta tag
- `customer.html` - 加入 CSP meta tag
- `kitchen.html` - 加入 CSP meta tag
- `queue.html` - 加入 CSP meta tag
- `TESTING.md` - 新建：P2P 多設備同步測試指引文件

### Commits
- `e5a015c` - feat: PWA 圖示生成 + CSP Headers + P2P 測試指引

### 5-Question Reboot Check
1. **做什麼？** PWA 圖示從 placeholder 替換為正式 PNG、加入 CSP 安全標頭、建立多設備同步測試指引
2. **進度？** 100% 完成 — commit `e5a015c` 已 push
3. **下一步？** (1) 按 TESTING.md 指引進行真實多設備 P2P 同步測試 (2) 考慮自架 PeerJS 信令伺服器取代公共伺服器 (3) CSP 在真實部署環境驗證（確認無 blocked resources） (4) 考慮 Lighthouse PWA 審計
4. **阻礙？** PeerJS 仍使用公共信令伺服器（0.peerjs.com）；CSP 策略需在真實部署環境驗證是否有遺漏
5. **檔案？** `TESTING.md`（測試指引）、`vite.config.ts`（PWA manifest）、`index.html`/`customer.html`/`kitchen.html`/`queue.html`（CSP headers）

---

## Session: 2026-02-20 (2) - 安全掃描修復 + 程式碼簡化

### 完成項目
- [x] npm audit 漏洞修復：overrides minimatch >=10.2.1，0 vulnerabilities
- [x] P2P payload 驗證：usePeerSync.ts 加入 5 個型別驗證函式，防止惡意/畸形資料
- [x] 密碼加鹽：新建 src/lib/crypto.ts（hashPassword + generateSalt），向下相容無鹽模式
- [x] 移除密碼提示：「預設密碼: 1234」改為「請洽管理員取得密碼」
- [x] 密碼複雜度：MIN_PASSWORD_LENGTH = 4
- [x] hashPassword 去重：KitchenLogin + KitchenSettings 改用共用 crypto.ts
- [x] 共用工具函式：generateId() + localized() 消除 20 處重複
- [x] syncHandlers.ts：統一 P2P/BroadcastChannel 訊息處理邏輯
- [x] usePeerSync 簡化：handleMessage 40+ 行縮減為 4 行
- [x] useBroadcastListener 簡化：62 行縮減為 18 行
- [x] 元件簡化：ToggleSwitch 抽取、stateMap/sizeClasses lookup 取代 ternary
- [x] stores 簡化：移除重複 generateId，updateOrderStatus 用 lookup map
- [x] `npm run build` 通過
- [x] 已 push 到遠端

### 修改檔案
- `src/lib/crypto.ts` - 新建：hashPassword（加鹽 SHA-256）+ generateSalt 共用模組
- `src/lib/syncHandlers.ts` - 新建：統一 P2P/BroadcastChannel 訊息處理邏輯
- `src/hooks/usePeerSync.ts` - P2P payload 驗證函式 + handleMessage 簡化為 syncHandlers 呼叫
- `src/hooks/useBroadcastListener.ts` - 62 行簡化為 18 行，改用 syncHandlers
- `src/components/kitchen/KitchenLogin.tsx` - 移除內嵌 hashPassword，改用 crypto.ts；密碼提示改為「請洽管理員取得密碼」
- `src/components/kitchen/KitchenSettings.tsx` - 移除內嵌 hashPassword，改用 crypto.ts；加入密碼複雜度驗證
- `src/stores/useOrderStore.ts` - 移除重複 generateId，updateOrderStatus 用 lookup map
- `src/stores/useMenuStore.ts` - 移除重複 generateId，改用共用 generateId
- `src/stores/useCartStore.ts` - 移除重複 generateId，改用共用 generateId
- `src/components/kitchen/OrderCard.tsx` - stateMap/sizeClasses lookup 取代 ternary
- `src/components/kitchen/InventoryPanel.tsx` - ToggleSwitch 抽取簡化
- `package.json` - overrides minimatch >=10.2.1 修復 npm audit 漏洞

### Commits
- `ab9de1e` - fix: 安全掃描修復 + 程式碼簡化

### 5-Question Reboot Check
1. **做什麼？** 安全掃描修復（npm audit、P2P payload 驗證、密碼加鹽）+ 程式碼簡化（共用工具函式、syncHandlers 統一訊息處理）
2. **進度？** 100% 完成 — commit 已 push
3. **下一步？** (1) 替換 PWA placeholder 圖示 (2) 真實裝置多設備 P2P 同步測試 (3) 密碼加鹽後的 migration 測試（確認舊密碼向下相容） (4) 考慮 CSP header 設定
4. **阻礙？** PWA 圖示仍為 placeholder；PeerJS 使用公共信令伺服器；密碼加鹽的向下相容需要在真實環境驗證
5. **檔案？** `src/lib/crypto.ts`（密碼加鹽邏輯）、`src/lib/syncHandlers.ts`（統一訊息處理）、`src/hooks/usePeerSync.ts`（P2P payload 驗證）、`src/components/kitchen/KitchenSettings.tsx`（密碼設定）

---

## Session: 2026-02-20 - MPA 架構遷移 + 跨分頁同步修復

### 完成項目
- [x] SPA → MPA 多頁面架構遷移（4 個獨立入口：landing、customer、kitchen、queue）
- [x] Landing 頁面改版（簡化為只顯示「開始點餐」按鈕）
- [x] 自訂日式提燈動畫 SVG 圖示
- [x] 修復 MPA 跨分頁即時同步問題（廚房修改菜單/庫存後，顧客和叫號頁面不會即時更新）
- [x] `npm run build` 通過
- [x] 已 push 到遠端

### 修改檔案
- `src/main-landing.tsx` - 新建：Landing 頁面獨立入口
- `src/main-customer.tsx` - 新建：顧客端獨立入口，加入 useBroadcastListener
- `src/main-kitchen.tsx` - 新建：廚房端獨立入口
- `src/main-queue.tsx` - 新建：叫號端獨立入口，加入 useBroadcastListener
- `src/hooks/useBroadcastListener.ts` - 新建：輕量 BroadcastChannel 監聽 hook，接收廚房端的 inventory/menu 同步訊息
- `src/components/kitchen/KitchenView.tsx` - 用 useMenuStore.subscribe 自動偵測 store 變化，觸發 broadcastInventorySync/broadcastMenuSync
- `src/components/landing/LandingPage.tsx` - 改版為只顯示「開始點餐」按鈕

### 修復細節：MPA 跨分頁即時同步
- **問題**：廚房修改菜單/庫存（如標記完售）後，顧客和叫號頁面不會即時更新
- **根因**：
  1. InventoryPanel/MenuEditor 直接修改 Zustand store，但不呼叫 broadcastInventorySync/broadcastMenuSync
  2. 顧客端/叫號端沒有 BroadcastChannel 監聯器
- **解決**：
  1. KitchenView 用 useMenuStore.subscribe 自動偵測 store 變化 → 觸發 broadcast
  2. 新增 useBroadcastListener hook → Customer/Queue 入口掛載

### Commits
- `88eb6f4` - feat: SPA 轉 MPA 多頁面架構 + Landing 頁面改版
- `cb16e14` - fix: 修復 MPA 跨分頁即時同步問題

### 5-Question Reboot Check
1. **做什麼？** MPA 架構遷移並修復跨分頁即時同步問題
2. **進度？** 100% 完成 — 兩個 commit 已 push
3. **下一步？** (1) 替換 PWA placeholder 圖示 (2) 真實裝置多設備 P2P 同步測試 (3) MPA 各頁面的 PWA 離線快取驗證 (4) 考慮 PeerJS 跨裝置同步是否也有類似問題需修復
4. **阻礙？** PWA 圖示仍為 placeholder；MPA 架構下 PeerJS 跨裝置同步尚未完整測試
5. **檔案？** `src/hooks/useBroadcastListener.ts`（BroadcastChannel 監聽）、`src/components/kitchen/KitchenView.tsx`（自動 broadcast 邏輯）、`src/main-customer.tsx` 和 `src/main-queue.tsx`（MPA 入口）

---

## Session: 2026-02-07 (2) - 宏麵屋品牌主題改造

### 完成項目
- [x] 里程碑 1: 基礎設施層 — index.html title/theme-color、Google Fonts (4 字型)、index.css 全重寫(@theme 色板/語義變數/dark 模式/14 動畫/日式圖案)、PWA manifest 更新、stallName 預設「宏麵屋」
- [x] 里程碑 2: 共用元件 + UI 基礎 — 新建 5 個日式裝飾元件 (SteamAnimation, WaveDivider, CloudDivider, JapaneseFrame, RamenBowlIcon)、微調 Button/Badge/Dialog/Card 樣式
- [x] 里程碑 3: 菜單與翻譯 — 分類改為拉麵/配菜/飲料/甜點、13 個品項(豚骨$180 等)、appName→宏麵屋、soldOut→完売
- [x] 里程碑 4: 顧客端頁面 — LandingPage(青海波+書法 Logo)、CustomerView(毛玻璃 Header)、MenuGrid(膠囊分類+日式標題)、MenuItemCard(木色邊線+朱紅價格+完売印章)、ItemDetail(木色選項)、Cart(和紙背景)、OrderSuccess(RamenBowl+放射光芒)
- [x] 里程碑 5: 廚房端深色主題 — KitchenView(炭色背景+金色 Logo)、KitchenLogin(明朝體)、OrderBoard(深色半透明)、OrderCard(深灰+狀態邊框)、InventoryPanel/MenuEditor/RevenueReport/KitchenSettings(font-heading+金色長條圖)
- [x] 里程碑 6: 叫號看板 + 收尾 — QueueView(炭色+書法+JapaneseFrame+超大等寬號碼+脈動+青海波)、ConnectionStatus(暖色調)
- [x] `npm run build` 通過

### 修改檔案
- `index.html` - title→宏麵屋、theme-color→#d4852a、Google Fonts 載入
- `src/index.css` - 完全重寫：@theme 色板、語義變數、dark 模式、14 個 @keyframes、日式圖案、互動效果
- `vite.config.ts` - PWA manifest name/theme_color/background_color 更新
- `src/stores/useSettingsStore.ts` - stallName 預設值→宏麵屋
- `src/components/shared/SteamAnimation.tsx` - 新建：SVG 蒸氣動畫
- `src/components/shared/WaveDivider.tsx` - 新建：青海波分隔線
- `src/components/shared/CloudDivider.tsx` - 新建：雲紋分隔線
- `src/components/shared/JapaneseFrame.tsx` - 新建：四角裝飾邊框
- `src/components/shared/RamenBowlIcon.tsx` - 新建：拉麵碗 SVG 圖示
- `src/components/ui/button.tsx` - default→朱紅、secondary→木色邊框、圓角→xl
- `src/components/ui/badge.tsx` - 加 font-body
- `src/components/ui/dialog.tsx` - overlay 暖色調、content 和紙色+圓角 2xl
- `src/constants/index.ts` - 菜單品項→拉麵主題、翻譯 appName→宏麵屋
- `src/components/landing/LandingPage.tsx` - 青海波背景+SteamAnimation+書法 Logo+CloudDivider
- `src/components/customer/CustomerView.tsx` - 毛玻璃 Header+朱紅購物車浮動欄
- `src/components/customer/MenuGrid.tsx` - 膠囊分類標籤+日式分組標題
- `src/components/customer/MenuItemCard.tsx` - 木色邊線+朱紅明朝體價格+完売印章
- `src/components/customer/ItemDetail.tsx` - 木色選項框+朱紅價格
- `src/components/customer/Cart.tsx` - 和紙色背景+朱紅明朝體總價
- `src/components/customer/OrderSuccess.tsx` - RamenBowlIcon+SteamAnimation+放射光芒
- `src/components/kitchen/KitchenView.tsx` - dark class+炭色背景+金色 Logo+Tab 指示器
- `src/components/kitchen/KitchenLogin.tsx` - 明朝體標題+等寬密碼
- `src/components/kitchen/OrderBoard.tsx` - 深色半透明欄位+亮色狀態文字
- `src/components/kitchen/OrderCard.tsx` - 深灰卡片+左側狀態邊框+等寬號碼
- `src/components/kitchen/InventoryPanel.tsx` - font-heading
- `src/components/kitchen/MenuEditor.tsx` - font-heading
- `src/components/kitchen/RevenueReport.tsx` - font-heading+金色長條圖
- `src/components/kitchen/KitchenSettings.tsx` - font-heading+toggle 主色
- `src/components/queue/QueueView.tsx` - 炭色+書法+JapaneseFrame+超大等寬號碼+脈動+青海波
- `src/components/shared/ConnectionStatus.tsx` - 暖色調邊框+font-mono peerId

### 5-Question Reboot Check
1. **做什麼？** 宏麵屋品牌主題改造 — 將通用點餐系統改造為日式拉麵店風格
2. **進度？** 100% 完成 — 6 個里程碑全部交付，build 通過
3. **下一步？** (1) 真實裝置測試深色/淺色切換 (2) 替換 PWA placeholder 圖示為宏麵屋設計 (3) 字型載入效能優化(font-display: swap 確認) (4) 日式圖案在低階裝置的效能測試
4. **阻礙？** PWA 圖示仍為 placeholder；Google Fonts 需網路首次載入（之後 SW 快取）
5. **檔案？** `src/index.css`（主題色板+動畫+圖案）、`src/components/shared/`（5 個新日式元件）、`src/constants/index.ts`（菜單+翻譯）

---

## Session: 2026-02-07 (1)

### 完成項目
- [x] 全部 8 個里程碑驗收完成，專案進入穩定維護階段
- [x] `npm run build` 通過（CSS 29.9 KB, JS 435.5 KB / gzip ~129 KB）
- [x] PWA precache 10 entries 正常運作
- [x] 專案文件更新（PROGRESS.md, FINDINGS.md, CLAUDE.md, MEMORY.md）

### 修改檔案
- `PROGRESS.md` - 新增完工 session 記錄
- `FINDINGS.md` - 新增實作階段技術發現（Translations 型別、建置產出、P2P 同步模式）

### 5-Question Reboot Check
1. **做什麼？** 現場點餐系統已完成全部核心功能開發，進入測試/優化階段
2. **進度？** 100% 完成 - 8 個里程碑全部交付，建置通過無錯誤
3. **下一步？** (1) 替換 PWA placeholder 圖示為正式設計 (2) 真實場景使用測試 (3) 考慮 P1 改進項目：觸控手勢優化、振動回饋
4. **阻礙？** PWA 圖示仍為 placeholder；PeerJS 使用公共信令伺服器，正式使用建議自架
5. **檔案？** `CLAUDE.md`（專案架構）、`FINDINGS.md`（設計研究 + 技術發現）、`src/App.tsx`（路由入口）

---

## Session: 2026-02-06

### 完成項目
- [x] 專案初始化 (Vite 6 + React 19 + TypeScript 5)
- [x] Tailwind CSS 4 + shadcn/ui (Radix UI) 配置
- [x] Zustand Stores (menu, cart, order, settings + persist)
- [x] 首頁 LandingPage (三大入口 + 語言切換)
- [x] 顧客點餐介面 (MenuGrid, MenuItemCard, ItemDetail, Cart, OrderSuccess)
- [x] 廚房管理介面 (密碼登入, 三欄看板, 庫存管理, 菜單編輯器, 設定)
- [x] 叫號看板 (大字號碼, Web Audio API 音效, Web Speech 語音播報, 全螢幕)
- [x] PeerJS P2P 同步 (Host/Client, 斷線重連, BroadcastChannel)
- [x] 營收報表 (KPI 卡片, 銷量排行, 時段分布, 手動調整)
- [x] PWA 配置 (vite-plugin-pwa, Service Worker, 離線快取)
- [x] 多語言系統 (中文/英文完整翻譯)

### 修改檔案
- 全部為新建檔案，完整專案從零打造
- 主要目錄：`src/components/`, `src/stores/`, `src/hooks/`, `src/lib/`, `src/constants/`, `src/types/`

### 技術里程碑摘要
| 里程碑 | 內容 | 狀態 |
|--------|------|------|
| M1 專案初始化 | Vite 6 + React 19 + TS 5 + Tailwind 4 + shadcn/ui | 完成 |
| M2 狀態管理 | 4 個 Zustand stores (menu, cart, order, settings) + persist | 完成 |
| M3 顧客介面 | LandingPage, MenuGrid, MenuItemCard, ItemDetail, Cart, OrderSuccess | 完成 |
| M4 廚房介面 | KitchenLogin, OrderBoard, OrderCard, InventoryPanel, MenuEditor, KitchenSettings | 完成 |
| M5 叫號看板 | QueueView (120px+ 號碼, Web Audio, Web Speech, 全螢幕) | 完成 |
| M6 P2P 同步 | PeerService, usePeerSync, BroadcastChannel, 斷線重連, ConnectionStatus | 完成 |
| M7 營收報表 | RevenueReport (KPI, 銷量排行, 時段分布, 手動調整) | 完成 |
| M8 PWA+多語言 | vite-plugin-pwa, 120+ 翻譯鍵 (zh/en), favicon | 完成 |

### 5-Question Reboot Check
1. **做什麼？** 現場點餐系統（園遊會/市集/小型餐廳），含點餐、廚房、叫號、P2P 同步
2. **進度？** 8 個里程碑全部完成，`npm run build` 通過
3. **下一步？** UI 測試微調、真實場景測試、PWA 圖示替換
4. **阻礙？** PWA 圖示目前是 placeholder，需設計真正的圖示
5. **檔案？** CLAUDE.md（專案架構）、FINDINGS.md（研究結果）
