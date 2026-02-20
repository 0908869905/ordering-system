# 宏麵屋 - 現場點餐系統

## 專案概述
- **類型**：PWA 現場點餐系統（適用於園遊會、市集、小型餐廳）
- **品牌**：宏麵屋（日式拉麵店主題）
- **技術棧**：Vite 6 + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui + Zustand 5 + PeerJS

## 目錄結構
```
src/
├── components/
│   ├── ui/               # shadcn/ui 元件 (Button, Card, Dialog, Badge, Input, Textarea)
│   ├── landing/          # 首頁 (LandingPage)
│   ├── customer/         # 顧客端 (CustomerView, MenuGrid, MenuItemCard, ItemDetail, Cart, OrderSuccess)
│   ├── kitchen/          # 廚房端 (KitchenView, KitchenLogin, OrderBoard, OrderCard, InventoryPanel, MenuEditor, RevenueReport, KitchenSettings)
│   ├── queue/            # 叫號端 (QueueView)
│   └── shared/           # 共用 (ConnectionStatus, SteamAnimation, WaveDivider, CloudDivider, JapaneseFrame, RamenBowlIcon)
├── stores/               # Zustand stores (useMenuStore, useCartStore, useOrderStore, useSettingsStore)
├── hooks/                # usePeerSync, useSound, useSpeech, useBroadcastListener
├── lib/                  # utils (cn + generateId + localized), peer (PeerService + BroadcastChannel), crypto (hashPassword + generateSalt), syncHandlers (統一 P2P/BC 訊息處理)
├── types/                # TypeScript 型別
├── constants/            # 翻譯 (zh/en)、預設菜單
├── main-landing.tsx      # MPA 入口：首頁
├── main-customer.tsx     # MPA 入口：顧客端（含 BroadcastChannel 監聽）
├── main-kitchen.tsx      # MPA 入口：廚房端
└── main-queue.tsx        # MPA 入口：叫號端（含 BroadcastChannel 監聯）
```

## 常用指令
```bash
# 開發（區網可存取）
npm run dev

# 建置
npm run build

# 預覽
npm run preview
```

## 關鍵設計決策
- **MPA 多頁面架構**：每個角色（landing/customer/kitchen/queue）有獨立 HTML 入口，Vite 多入口建置
- **Single-Writer 模式**：Kitchen 為唯一資料權威來源
- **P2P 架構**：Kitchen 作為 Host，Customer/Queue 作為 Client
- **同步策略**：PeerJS (跨設備) + BroadcastChannel (同裝置跨分頁)
- **BroadcastChannel 自動同步**：KitchenView 用 `useMenuStore.subscribe()` 偵測 store 變化自動 broadcast；Customer/Queue 用 `useBroadcastListener` hook 監聽
- **持久化**：Zustand persist → localStorage（MPA 各頁面共享 localStorage，但 store 實例獨立）
- **密碼保護**：SHA-256 加鹽雜湊（src/lib/crypto.ts），向下相容無鹽模式
- **翻譯型別**：`Translations = { [K in keyof typeof translations.zh]: string }` 解決字面量衝突

## 品牌主題系統
- **色板**：@theme 定義 primary(木色 #b5651d)、accent(朱紅 #c23616)、warm(暖灰)
- **字型**：Shippori Mincho(heading/明朝體)、Noto Sans TC(body)、Yuji Syuku(display/書法)、JetBrains Mono(mono/等寬)
- **深色模式**：廚房端局部 `.dark` class，非全域切換
- **日式裝飾元件**：SteamAnimation、WaveDivider、CloudDivider、JapaneseFrame、RamenBowlIcon
- **CSS 圖案**：青海波(seigaiha)用 SVG data URI 實現，零額外請求
- **動畫**：14 個 @keyframes，僅使用 transform/opacity（GPU 加速）

## 開發規範
- shadcn/ui 是手動安裝 Radix UI + CVA，不用 CLI init
- Tailwind CSS 4 用 `@import 'tailwindcss'` 不是 `@tailwind` directives
- Path alias `@/` → `./src/*`
- 觸控目標最小 48px
- 色彩編碼：紅(待付款)、黃(製作中)、綠(已完成)
- 字型語義 class：`font-heading`(明朝體)、`font-body`(黑體)、`font-display`(書法)、`font-mono`(等寬)
- 顧客端用淺色暖調(和紙色 warm-50)、廚房端用深色炭調(#1a1714)
- 品牌色 accent(朱紅) 用於 CTA 按鈕和價格、primary(木色) 用於裝飾和邊框

## 注意事項
- 叫號看板需用戶先互動才能解鎖音效（瀏覽器限制）
- PWA 圖示目前是 placeholder，需替換真正的 PNG 圖示
- PeerJS 使用公共信令伺服器 (0.peerjs.com)
