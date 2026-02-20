# 現場點餐系統 - 設計研究報告

> 研究日期：2026-02-06
> 適用場景：學校園遊會、小型餐廳、市集攤位
> 現有技術棧：React 18 + TypeScript + Vite + PeerJS (P2P)

---

## 目錄

1. [設計原則總結](#1-設計原則總結)
2. [技術選型建議](#2-技術選型建議)
3. [功能清單與優先級](#3-功能清單與優先級)
4. [UI/UX 設計建議](#4-uiux-設計建議)
5. [架構建議](#5-架構建議)

---

## 1. 設計原則總結

### 1.1 核心設計哲學

基於對 Toast POS、Square POS 等業界領先系統的研究，現場點餐系統應遵循以下核心原則：

| 原則 | 說明 | 來源參考 |
|------|------|----------|
| **三次觸控規則** | 任何功能都應在三次觸控/點擊內完成 | [Hashmato POS Design](https://hashmato.com/point-of-sale-system-design-principles-tactics/) |
| **大按鈕、大間距** | WCAG 2.5.8 要求觸控目標最小 24x24px；建議 44x44px 以上 | [W3C WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) |
| **高對比度文字** | 在強光（戶外攤位）或昏暗環境（市集夜市）都能清楚閱讀 | [Shopify POS UI](https://www.shopify.com/retail/pos-ui) |
| **色彩編碼狀態** | 用色彩區分訂單狀態：未付款(紅)、製作中(黃)、已完成(綠)、已取餐(灰) | [Agente Studio POS Design](https://agentestudio.com/blog/design-principles-pos-interface) |
| **最少化認知負擔** | 每個畫面只展示當下最需要的資訊，避免資訊過載 | [dev.pro POS UX](https://dev.pro/insights/designing-a-pos-system-ten-user-experience-tactics-that-improve-usability/) |
| **容錯設計** | 所有破壞性操作（取消訂單、清除紀錄）都需要二次確認 | [Final POS Design](https://finalpos.com/7-key-principles-of-effective-pos-system-design/) |

### 1.2 場景特殊性

現場點餐系統（園遊會/市集）與一般餐廳 POS 有幾個關鍵差異：

- **網路不穩定**：戶外場景可能缺乏穩定 Wi-Fi，必須支援離線運作
- **操作者非專業人士**：園遊會學生攤位的操作者可能是第一次使用
- **高峰流量短暫而密集**：午餐時段可能在 1 小時內湧入大量訂單
- **設備多樣**：可能用手機、平板、甚至借來的筆電
- **生命週期短**：可能只使用一天，設定必須極簡

---

## 2. 技術選型建議

### 2.1 前端框架：React 18 + TypeScript + Vite (維持現有選擇)

目前專案的技術選擇已經相當合理，建議維持：

| 技術 | 理由 |
|------|------|
| **React 18** | 生態系成熟、社群龐大、豐富的 UI 元件庫 |
| **TypeScript** | 型別安全減少執行時期錯誤，在訂單/金額計算場景尤為重要 |
| **Vite** | 極快的 HMR 開發體驗、優秀的建置效能、原生支援 PWA 插件 |

參考：[Advanced Guide to Using Vite with React 2025](https://codeparrot.ai/blogs/advanced-guide-to-using-vite-with-react-in-2025)

### 2.2 即時同步方案比較

目前專案使用 PeerJS（基於 WebRTC 的 P2P），以下是完整比較：

| 方案 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **PeerJS (P2P/WebRTC)** | 無需後端伺服器、延遲低、資料不經第三方 | 需要信令伺服器做初始連線、NAT 穿透可能失敗、連線穩定性不如 WebSocket、重連邏輯複雜 | 小型活動、隱私要求高 |
| **WebSocket** | 連線穩定、生態成熟、廣播功能直覺 | 需要架設 WebSocket 伺服器 | 有穩定網路的餐廳 |
| **BroadcastChannel API** | 零延遲同頁面通訊、無需網路、原生 API | 僅限同裝置的不同分頁，無法跨裝置 | 單機多分頁場景 |
| **純本地 (LocalStorage)** | 最簡單、無任何網路依賴 | 無法跨裝置、容量小 (5-10MB) | 單機使用 |

**建議**：維持 PeerJS 作為跨裝置同步方案，但需強化以下面向：

1. **斷線重連機制**：PeerJS 的 `disconnected` 事件只代表與信令伺服器斷開，現有連線仍然存活。需實作指數退避重試策略。
   - 參考：[PeerJS Issue #650](https://github.com/peers/peerjs/issues/650)
2. **備援方案**：當 P2P 連線失敗時，應允許用戶以「本機模式」繼續運作（目前已有此設計，很好）
3. **BroadcastChannel 互補**：在同裝置多分頁場景，使用 BroadcastChannel API 做同步（比 PeerJS 更可靠且零延遲）
   - 參考：[Chrome BroadcastChannel Blog](https://developer.chrome.com/blog/broadcastchannel)

### 2.3 資料持久化方案

| 方案 | 容量 | API 類型 | 資料型別 | 建議用途 |
|------|------|----------|----------|----------|
| **LocalStorage** | 5-10 MB | 同步（阻塞主線程） | 僅字串 | 簡單設定、語言偏好 |
| **IndexedDB** | 數 GB | 非同步（不阻塞） | 結構化資料、Blob | 訂單記錄、庫存資料、離線佇列 |
| **OPFS + WASM-SQLite** | 數 GB | 非同步 | 完整 SQL | 需要複雜查詢的大量資料 |

**建議**：

- **短期（目前專案）**：維持 LocalStorage 存儲訂單（目前資料量小，一場園遊會約幾百筆訂單，5MB 綽綽有餘）
- **中長期（擴展為小型餐廳系統）**：遷移至 IndexedDB，使用 [Dexie.js](https://dexie.org/) 封裝以簡化 API
- 參考：[LocalStorage vs IndexedDB](https://shiftasia.com/community/localstorage-vs-indexeddb-choosing-the-right-solution-for-your-web-application/)、[RxDB Storage Comparison](https://rxdb.info/articles/localstorage-indexeddb-cookies-opfs-sqlite-wasm.html)

### 2.4 PWA 離線支援

**強烈建議加入 PWA 支援**，原因：

1. 園遊會/市集場景網路不穩定，離線仍需運作
2. PWA 可以「安裝」到主畫面，使用體驗接近原生 App
3. Service Worker 可快取所有靜態資源，極速載入

**實作方式**：使用 `vite-plugin-pwa`，零配置即可獲得基本 PWA 功能。

```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '園遊會點餐系統',
        short_name: '點餐',
        theme_color: '#6d28d9',
        display: 'standalone',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
})
```

參考：[Vite PWA React Guide](https://vite-pwa-org.netlify.app/frameworks/react)、[Offline PWA with Vite+React](https://adueck.github.io/blog/caching-everything-for-totally-offline-pwa-vite-react/)

---

## 3. 功能清單與優先級

### P0 - 核心功能（必備，目前已實現）

| 功能 | 狀態 | 說明 |
|------|------|------|
| 菜單瀏覽與點餐 | 已實現 | CustomerView 包含分類、選項、備註 |
| 購物車管理 | 已實現 | 新增/刪除/數量調整 |
| 訂單送出與號碼牌 | 已實現 | 自動編號、顯示取餐號碼 |
| 廚房後台管理 | 已實現 | 訂單狀態流轉：未付款 > 製作中 > 完成 > 取餐 |
| 叫號顯示 | 已實現 | QueueView 大螢幕顯示 |
| P2P 跨裝置同步 | 已實現 | PeerJS 連線 |
| 庫存管理 | 已實現 | 即時庫存追蹤、售完標記 |
| 雙語支援 | 已實現 | 中文/英文切換 |
| 密碼保護後台 | 已實現 | SHA-256 密碼雜湊 |

### P1 - 重要改進（建議近期實施）

| 功能 | 優先理由 | 預估工作量 |
|------|----------|------------|
| **PWA 離線支援** | 園遊會網路不穩，離線運作是剛需 | 小（2-4 小時） |
| **音效叫號 + Web Speech API** | 叫號系統的核心用途，目前疑似僅有測試音效 | 中（4-8 小時） |
| **斷線重連強化** | PeerJS 斷線後的自動重連邏輯 | 中（4-8 小時） |
| **訂單修改功能** | 已有 editOrder UI，確保流程完整 | 小（2-4 小時） |
| **觸控手勢優化** | 滑動刪除、長按快捷操作 | 中（4-8 小時） |

### P2 - 體驗提升（可選但推薦）

| 功能 | 說明 | 預估工作量 |
|------|------|------------|
| **營收儀表板強化** | 加入更多 KPI：平均出餐時間、尖峰時段、熱門品項趨勢圖 | 大（8-16 小時） |
| **振動回饋** | 按鈕點擊時觸發手機振動（navigator.vibrate） | 小（1 小時） |
| **列印功能** | 支援瀏覽器列印或連接小型收據印表機 | 中（4-8 小時） |
| **多攤位支援** | 一個系統管理多個攤位 | 大（16+ 小時） |
| **BroadcastChannel 同分頁同步** | 同裝置多分頁即時同步 | 小（2-4 小時） |

### P3 - 進階功能（長期規劃）

| 功能 | 說明 |
|------|------|
| 客戶自助點餐 QR Code | 掃描 QR 即可在自己手機上點餐 |
| CRDT 衝突解決 | 使用 Yjs/Automerge 取代簡單的狀態同步 |
| 資料匯出 | 匯出 CSV/Excel 營收報表 |
| 歷史活動記錄 | 保存多次活動的銷售數據供對比 |

---

## 4. UI/UX 設計建議

### 4.1 點餐流程 (CustomerView) 最佳化

**目標**：讓完全沒使用過的客人在 30 秒內完成點餐。

```
當前流程（已相當精簡）：
瀏覽菜單 → 點擊品項 → 選擇選項/備註 → 加入購物車 → 確認送出

建議優化：
1. 菜單頁面直接顯示「+」按鈕，無選項的品項可一鍵加入
2. 購物車常駐底部浮動欄，隨時可見總金額與品項數
3. 熱門品項/推薦品項置頂顯示
```

**關鍵 UX 細節**：

| 設計要素 | 建議 | 原因 |
|----------|------|------|
| 按鈕尺寸 | 最小 48x48px（建議 56px 以上） | 戶外使用、手指操作，需要比室內更大的觸控目標 |
| 售完品項 | 灰色遮罩 + 「售完」標籤，保留在列表但不可點擊 | 讓客人知道有這個品項（下次可以來買） |
| 數量調整 | 使用 +/- 按鈕而非輸入框 | 減少鍵盤操作，觸控更友善 |
| 備註輸入 | 提供常見備註快捷標籤（少冰、不辣、加辣） | 減少打字需求 |
| 送出確認 | 使用模態視窗二次確認，顯示完整訂單摘要 | 防止誤觸 |
| 成功回饋 | 大字號碼牌 + 動畫 + 付款指引 | 確保客人記住號碼 |

參考：[Smashing Magazine Touch Targets](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/)、[Accessibility.digital.gov](https://accessibility.digital.gov/ux/touch-targets/)

### 4.2 廚房顯示系統 (KitchenView) 最佳化

基於 KDS 研究的建議：

**版面設計**：
```
+-----------+-----------+-----------+
| 未付款(紅) | 製作中(黃) | 已完成(綠) |
| #23       | #20       | #18      |
| #22       | #19       | #17      |
| #21       |           | #16      |
+-----------+-----------+-----------+
```

**關鍵設計要素**：

| 元素 | 建議 |
|------|------|
| **訂單卡片** | 大字號碼（至少 24px）+ 品項清單 + 時間戳記 |
| **時間追蹤** | 每張訂單顯示「等待時間」，超過閾值（如 10 分鐘）自動高亮警示 |
| **色彩系統** | 紅色=未付款、橙/黃色=製作中、綠色=已完成、灰色=已取餐/取消 |
| **操作按鈕** | 大面積滑動或單鍵操作完成狀態流轉 |
| **音效提示** | 新訂單進入時播放提示音 |
| **自動排序** | 依時間排序，最舊的在最上面（FIFO） |

參考：[Fresh Technology KDS Features](https://www.fresh.technology/blog/kitchen-display-system-features-you-need)、[WebstaurantStore KDS Guide](https://www.webstaurantstore.com/article/1002/kitchen-display-systems.html)

KDS 可減少 40% 的出餐時間，減少 25% 的食材浪費。
參考：[Restroworks KDS Guide](https://www.restroworks.com/blog/best-kitchen-display-system/)

### 4.3 叫號系統 (QueueView) 最佳化

**視覺設計**：
```
+-------------------------------------+
|          現正叫號                     |
|          #  2 3                      |  ← 超大字體，至少 120px
|                                     |
|  準備中：#24  #25  #26              |  ← 次要資訊
|  歷史：  #22  #21  #20             |
+-------------------------------------+
```

**音效與語音叫號**：

建議使用 Web Speech Synthesis API 實現語音叫號：

```typescript
function callNumber(orderNumber: number) {
  const utterance = new SpeechSynthesisUtterance(
    `號碼 ${orderNumber} 號，請取餐`
  );
  utterance.lang = 'zh-TW';
  utterance.rate = 0.9;  // 稍慢以確保清晰
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}
```

| 音效類型 | 建議 |
|----------|------|
| 新訂單提示 | 短促「叮咚」聲 |
| 叫號提示 | 語音播報「號碼 XX 號，請取餐」 |
| 重複叫號 | 點擊號碼可重複播報 |
| 音量控制 | 提供可調音量（0-100%） |

參考：[MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)、[Chrome Speech Synthesis](https://developer.chrome.com/blog/web-apps-that-talk-introduction-to-the-speech-synthesis-api)

### 4.4 營收報表設計

基於業界 KPI 儀表板研究，建議追蹤以下指標：

**核心指標**：

| KPI | 計算方式 | 重要性 |
|-----|----------|--------|
| 總營收 | 所有已完成訂單金額總和 | 最核心 |
| 訂單數 | 已完成訂單總數 | 核心 |
| 平均客單價 | 總營收 / 訂單數 | 核心 |
| 品項銷量排行 | 按品項統計銷售數量 | 庫存規劃 |
| 時段分布 | 按小時統計訂單量 | 人力調配 |
| 平均出餐時間 | (完成時間 - 付款時間) 平均值 | 效率評估 |

**視覺化建議**：
- 頂部：大數字卡片顯示核心 KPI（總營收、訂單數、客單價）
- 中部：品項銷量長條圖
- 底部：時段訂單量折線圖

參考：[Databox Restaurant KPI](https://databox.com/restaurant-kpi-dashboard)、[NetSuite Restaurant KPIs](https://www.netsuite.com/portal/resource/articles/erp/restaurant-kpis.shtml)

---

## 5. 架構建議

### 5.1 整體架構圖

```
                    ┌──────────────────────────────┐
                    │     PeerJS Signaling Server   │
                    │     (Cloud / 0.peerjs.com)    │
                    └───────────┬──────────────────┘
                                │ 僅初始連線用
                    ┌───────────┴──────────────────┐
                    │                              │
              ┌─────┴─────┐                  ┌─────┴─────┐
              │  Kitchen   │◄── WebRTC P2P ──►│ Customer  │
              │  (Host)    │    DataChannel   │ (Client)  │
              │            │                  │           │
              │ LocalStorage│                 │LocalStorage│
              │  (Orders)  │                  │ (History) │
              └─────┬──────┘                  └───────────┘
                    │
                    │ BroadcastChannel (同裝置)
                    │ 或 WebRTC P2P (跨裝置)
                    │
              ┌─────┴──────┐
              │   Queue    │
              │  Display   │
              │            │
              │ LocalStorage│
              │  (Cache)   │
              └────────────┘
```

### 5.2 資料流設計

```
客人點餐流程：
Customer → [SUBMIT_ORDER] → Kitchen → [處理 + 儲存] → [ORDER_CREATED] → Customer
                                    ↓
                              [SYNC_ORDERS] → Queue Display

廚房狀態更新：
Kitchen → [修改狀態] → LocalStorage → [KITCHEN_ACTION] → All Peers
                                    → BroadcastChannel → 同裝置分頁

庫存更新：
Kitchen → [修改庫存] → [SYNC_INVENTORY] → All Peers (Customer 端顯示售完)
```

### 5.3 離線策略

```
離線模式處理流程：

1. 偵測連線狀態
   - navigator.onLine
   - PeerJS connection state
   - 心跳機制 (每 30 秒 ping)

2. 離線時的處理
   ┌──────────────────────────────────────────────┐
   │ Customer 端：                                 │
   │ - 顯示「離線模式」提示                        │
   │ - 訂單存入本機 pending queue                  │
   │ - 使用本機號碼牌（警告可能重複）              │
   │                                              │
   │ Kitchen 端：                                  │
   │ - 正常運作（Kitchen 是資料主節點）            │
   │ - 離線訂單重新上線後自動同步                  │
   │                                              │
   │ Queue 端：                                    │
   │ - 使用最後同步的資料繼續顯示                  │
   │ - 顯示「同步中斷」狀態                       │
   └──────────────────────────────────────────────┘

3. 重新上線後
   - 自動重連 PeerJS
   - 同步所有離線期間的變更
   - 衝突解決：Kitchen 端資料為權威來源 (Single-Writer)
```

### 5.4 衝突解決策略

對於現場點餐系統，**不建議**使用 CRDT（過於複雜），推薦 **Single-Writer 模式**：

| 策略 | 說明 | 適用性 |
|------|------|--------|
| **Single-Writer (推薦)** | Kitchen 端為唯一寫入權威，Customer 只能提交訂單、不能修改狀態 | 最適合現場點餐場景 |
| **Last-Write-Wins** | 最後一次寫入覆蓋之前的值 | 簡單但可能丟失資料 |
| **CRDT** | 無衝突複製資料型別，自動合併 | 過於複雜，園遊會場景不需要 |

**理由**：
- CRDT 能解決資料結構衝突，但無法解決業務邏輯衝突（如兩人同時訂購最後一份庫存）
- 園遊會場景的資料流天然是單向的：客人下單 → 廚房處理
- Kitchen 作為唯一權威來源是最簡單、最可靠的方案

參考：[CRDT Limitations](https://dev.to/biozal/the-cascading-complexity-of-offline-first-sync-why-crdts-alone-arent-enough-2gf)、[TypeScript CRDT Toolkits](https://medium.com/@2nick2patel2/typescript-crdt-toolkits-for-offline-first-apps-conflict-free-sync-without-tears-df456c7a169b)

### 5.5 效能優化建議

針對大量訂單（園遊會高峰期可能每小時 100+ 筆訂單）的效能優化：

| 優化項目 | 方法 | 說明 |
|----------|------|------|
| **列表虛擬化** | react-window 或 react-virtuoso | 僅渲染可視區域內的訂單卡片，避免 DOM 節點過多 |
| **React.memo** | 對訂單卡片元件使用 memo | 避免無關狀態更新觸發重渲染 |
| **useMemo / useCallback** | 對篩選/排序/統計邏輯快取 | 避免每次渲染都重新計算 |
| **分頁載入** | 歷史訂單分批載入（每頁 20 筆） | 減少初始渲染壓力 |
| **定時清理** | 自動將 24 小時前的已取餐訂單移至歸檔 | 減少主列表資料量 |
| **Web Worker** | 將營收統計/報表計算移至 Worker | 避免阻塞主線程 |

參考：[React Virtualization Guide](https://medium.com/@ignatovich.dm/virtualization-in-react-improving-performance-for-large-lists-3df0800022ef)、[react-window](https://github.com/bvaughn/react-virtualized)

### 5.6 推薦專案結構

```
ordering-system/
├── public/
│   ├── icons/                    # PWA 圖示
│   ├── sounds/                   # 音效檔案
│   └── manifest.json             # PWA manifest (由 vite-plugin-pwa 生成)
├── src/
│   ├── components/
│   │   ├── customer/
│   │   │   ├── MenuGrid.tsx      # 菜單網格
│   │   │   ├── MenuItem.tsx      # 單一品項卡片
│   │   │   ├── Cart.tsx          # 購物車
│   │   │   ├── OptionSelector.tsx # 選項選擇器
│   │   │   └── OrderSuccess.tsx  # 下單成功頁面
│   │   ├── kitchen/
│   │   │   ├── OrderCard.tsx     # 訂單卡片
│   │   │   ├── OrderColumn.tsx   # 狀態欄位
│   │   │   ├── InventoryPanel.tsx # 庫存面板
│   │   │   └── RevenueReport.tsx # 營收報表
│   │   ├── queue/
│   │   │   ├── CurrentNumber.tsx # 當前叫號
│   │   │   ├── WaitingList.tsx   # 等候列表
│   │   │   └── QueueHistory.tsx  # 叫號歷史
│   │   └── shared/
│   │       ├── Button.tsx        # 通用按鈕（統一觸控目標大小）
│   │       ├── Modal.tsx         # 通用模態視窗
│   │       └── StatusBadge.tsx   # 狀態標籤
│   ├── hooks/
│   │   ├── usePeer.ts           # PeerJS 連線邏輯
│   │   ├── useOrders.ts         # 訂單 CRUD 邏輯
│   │   ├── useInventory.ts      # 庫存管理邏輯
│   │   ├── useSpeech.ts         # Web Speech API 封裝
│   │   └── useSound.ts          # 音效播放
│   ├── services/
│   │   ├── storage.ts           # 資料持久化抽象層
│   │   ├── peerService.ts       # P2P 通訊服務
│   │   └── speechService.ts     # 語音合成服務
│   ├── contexts/
│   │   ├── LanguageContext.tsx   # 語言切換
│   │   └── OrderContext.tsx      # 訂單狀態管理
│   ├── constants/
│   │   ├── menu.ts              # 菜單資料
│   │   └── translations.ts      # 翻譯文字
│   ├── types/
│   │   └── index.ts             # TypeScript 型別定義
│   ├── utils/
│   │   ├── formatters.ts        # 格式化工具
│   │   └── validators.ts        # 驗證工具
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**重構理由**：
- 目前所有元件在單一檔案中（如 KitchenView.tsx 高達 1989 行），拆分後更易維護
- 自訂 Hook 將業務邏輯與 UI 分離
- 服務層抽象方便日後替換底層技術（如 LocalStorage → IndexedDB）

---

## 附錄：參考資源

### POS UI/UX 設計
- [Hashmato - POS System Design Principles](https://hashmato.com/point-of-sale-system-design-principles-tactics/)
- [dev.pro - 10 UX Tactics for POS](https://dev.pro/insights/designing-a-pos-system-ten-user-experience-tactics-that-improve-usability/)
- [Creative Navy - POS Design Principles](https://medium.com/uxjournal/the-design-principles-in-the-pos-system-pos-design-guide-part-2-57d1bcb30ac0)
- [Shopify - POS UI Design](https://www.shopify.com/retail/pos-ui)
- [Agente Studio - POS Design for Retail & Restaurants](https://agentestudio.com/blog/design-principles-pos-interface)
- [Final POS - 7 Key Design Principles](https://finalpos.com/7-key-principles-of-effective-pos-system-design/)

### KDS 廚房顯示系統
- [WebstaurantStore - KDS Guide](https://www.webstaurantstore.com/article/1002/kitchen-display-systems.html)
- [Restroworks - Best KDS Guide](https://www.restroworks.com/blog/best-kitchen-display-system/)
- [Fresh Technology - 17 KDS Features](https://www.fresh.technology/blog/kitchen-display-system-features-you-need)
- [GoTab - Ultimate KDS Guide 2025](https://gotab.com/latest/the-ultimate-guide-to-kitchen-display-systems-in-2025)

### 技術架構
- [Vite PWA - React Integration](https://vite-pwa-org.netlify.app/frameworks/react)
- [Offline PWA with Vite+React](https://adueck.github.io/blog/caching-everything-for-totally-offline-pwa-vite-react/)
- [RxDB - WebRTC P2P Replication](https://rxdb.info/replication-webrtc.html)
- [Ably - WebRTC vs WebSocket](https://ably.com/topic/webrtc-vs-websocket)
- [LocalStorage vs IndexedDB](https://shiftasia.com/community/localstorage-vs-indexeddb-choosing-the-right-solution-for-your-web-application/)
- [RxDB - Storage Comparison](https://rxdb.info/articles/localstorage-indexeddb-cookies-opfs-sqlite-wasm.html)
- [Chrome - BroadcastChannel API](https://developer.chrome.com/blog/broadcastchannel)

### 叫號與語音
- [MDN - Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [Chrome - Speech Synthesis API](https://developer.chrome.com/blog/web-apps-that-talk-introduction-to-the-speech-synthesis-api)

### 無障礙設計
- [W3C WCAG 2.1 - Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Smashing Magazine - Touch Target Sizes](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/)
- [Accessibility.digital.gov - Touch Targets](https://accessibility.digital.gov/ux/touch-targets/)

### 營收與 KPI
- [Databox - Restaurant KPI Dashboard](https://databox.com/restaurant-kpi-dashboard)
- [NetSuite - Restaurant KPIs](https://www.netsuite.com/portal/resource/articles/erp/restaurant-kpis.shtml)

### 衝突解決與 CRDT
- [TypeScript CRDT Toolkits](https://medium.com/@2nick2patel2/typescript-crdt-toolkits-for-offline-first-apps-conflict-free-sync-without-tears-df456c7a169b)
- [CRDT Limitations for Offline-First](https://dev.to/biozal/the-cascading-complexity-of-offline-first-sync-why-crdts-alone-arent-enough-2gf)

### 效能優化
- [React Virtualization Guide](https://medium.com/@ignatovich.dm/virtualization-in-react-improving-performance-for-large-lists-3df0800022ef)
- [PeerJS Reconnection Issues](https://github.com/peers/peerjs/issues/650)

### POS 系統比較
- [Square vs Toast Comparison](https://squareup.com/us/en/compare/square-vs-toast)
- [Toast POS Features](https://pos.toasttab.com/)

---

## 6. 實作階段技術發現 (2026-02-06 ~ 02-07)

> 以下為實際開發過程中的技術發現與解決方案。

### 6.1 Translations 型別字面量衝突

**問題**：`as const` 的翻譯物件在 Props 傳遞時，字面量型別 (`"顧客點餐"`) 與 `string` 型別不相容，導致 TypeScript 編譯錯誤。

**原因**：`translations.zh` 使用 `as const` 後，每個值的型別是精確字面量（如 `"顧客點餐"`），而元件 Props 期望的是 `string`。

**解決方案**：使用映射型別定義 `Translations`：
```typescript
type Translations = { [K in keyof typeof translations.zh]: string }
```
這保留了 key 的型別安全（確保所有翻譯 key 都存在），同時將 value 放寬為 `string`。

**選擇理由**：比起在每處使用 `as string` 斷言，映射型別是一次性解決且型別安全的方案。

### 6.2 PeerJS Single-Writer 同步模式

**問題**：P2P 架構下多端同時修改資料可能導致衝突。

**解決方案**：採用 Single-Writer 模式，Kitchen 為唯一資料權威來源：
- Customer 端只能「提交訂單」，不能修改訂單狀態
- Kitchen 收到訂單後產生正式訂單號碼
- 所有狀態變更（付款、製作、完成）只在 Kitchen 端操作
- Kitchen 透過 PeerJS DataChannel 廣播狀態給所有 Client

**同裝置補充**：BroadcastChannel API 處理同裝置多分頁同步，比 PeerJS 更可靠且零延遲。

### 6.3 Web Audio API 瀏覽器自動播放限制

**問題**：瀏覽器阻擋未經用戶互動的音效播放（`AudioContext was not allowed to start`）。

**解決方案**：
1. QueueView 啟動時顯示「點擊啟動音效」按鈕，要求用戶先互動
2. 互動後才初始化 AudioContext 並解鎖音效
3. Web Speech Synthesis API 同樣需要用戶互動後才能使用

**選擇理由**：這是瀏覽器安全政策，無法繞過，只能透過 UX 設計引導用戶互動。

### 6.4 Tailwind CSS 4 遷移注意事項

**問題**：Tailwind CSS 4 不再使用 `@tailwind base/components/utilities` directives。

**解決方案**：改用 CSS import 語法：
```css
@import 'tailwindcss';
```

**影響**：所有 Tailwind CSS 3 的教學和範例都需要調整 import 方式。

### 6.5 建置產出分析

最終建置結果（2026-02-06）：
| 資源 | 大小 | gzip |
|------|------|------|
| CSS | 29.9 KB | ~8 KB |
| JS | 435.5 KB | ~129 KB |
| PWA precache | 10 entries | - |

JS bundle 主要組成：React + ReactDOM (~140 KB), PeerJS (~80 KB), Radix UI (~60 KB), Zustand (~10 KB), 業務邏輯 (~145 KB)。

對於園遊會場景（可能是 4G 手機熱點），129 KB gzip 的 JS 在首次載入約需 1-2 秒，之後 PWA Service Worker 快取後可離線即時載入。

---

## 7. 品牌主題改造技術發現 (2026-02-07)

> 宏麵屋日式拉麵店主題改造過程中的技術發現。

### 7.1 Tailwind CSS 4 @theme 自訂色板

**問題**：需要建立完整的品牌色板系統（木色 primary、朱紅 accent、暖灰 warm），同時支援淺色/深色模式。

**解決方案**：使用 Tailwind CSS 4 的 `@theme` 指令定義自訂色板，搭配 `:root` 和 `.dark` CSS 變數實現語義色彩切換：
```css
@theme {
  --color-primary-50: #fdf8f0;
  --color-primary-600: #b5651d;
  /* ... */
  --color-accent-600: #c23616;
  --color-warm-50: #faf8f5;
}
```
搭配語義變數：
```css
:root { --background: var(--color-warm-50); }
.dark { --background: #1a1714; }
```

**選擇理由**：`@theme` 是 Tailwind CSS 4 原生方式，比 `tailwind.config.js` 的 `extend.colors` 更直覺，且所有自訂色彩自動生成對應的 utility class（如 `bg-primary-600`、`text-accent-500`）。

### 7.2 Google Fonts 載入策略與字型家族設計

**問題**：日式主題需要多種字型（書法標題、明朝體價格、正文、等寬號碼），但過多字型會拖慢首屏載入。

**解決方案**：
- 選用 4 個 Google Fonts：Shippori Mincho（明朝體）、Noto Sans TC（正文）、Yuji Syuku（書法標題）、JetBrains Mono（等寬號碼）
- `<link rel="preconnect">` 預連線 Google Fonts CDN
- CSS 定義語義字型家族：`font-heading`（Shippori Mincho）、`font-body`（Noto Sans TC）、`font-display`（Yuji Syuku）、`font-mono`（JetBrains Mono）
- PWA Service Worker 會快取字型檔，離線後仍可使用

**注意**：首次載入時若字型未下載完，會出現 FOUT（Flash of Unstyled Text）。Google Fonts 預設使用 `font-display: swap`，因此文字先以系統字型顯示，字型載入後才切換。

### 7.3 CSS @keyframes 動畫效能

**問題**：日式主題使用大量 CSS 動畫（蒸氣、脈動、浮動、淡入等共 14 個），需確保低階裝置不卡頓。

**解決方案**：
- 所有動畫只使用 `transform` 和 `opacity` 屬性（GPU 加速，不觸發 layout/paint）
- 蒸氣動畫使用 SVG path 而非 DOM 元素，減少渲染負擔
- 青海波等裝飾圖案使用 CSS `background-image`（SVG data URI），由 GPU 繪製
- 動畫持續時間設定較長（2-4 秒），降低每秒重繪次數

**選擇理由**：純 CSS 動畫比 JS 動畫（requestAnimationFrame）更省電，瀏覽器可在背景分頁自動暫停。

### 7.4 深色模式局部應用策略

**問題**：廚房端需要深色主題（護眼），但顧客端和首頁需要淺色主題（溫暖感），兩者可能在同頁面共存。

**解決方案**：不使用全域 `prefers-color-scheme` 媒體查詢，而是在 KitchenView 外層 div 加上 `dark` class，搭配 `.dark` CSS 變數覆寫：
```tsx
<div className="dark min-h-screen" style={{ background: '#1a1714' }}>
```
這樣只有 KitchenView 內部的元件會套用深色主題，其他頁面不受影響。

**選擇理由**：比 Context/Provider 更輕量，且 Tailwind CSS 4 原生支援 `dark:` variant 搭配 class 策略。

---

## 8. MPA 架構遷移與跨分頁同步 (2026-02-20)

> SPA → MPA 多頁面架構遷移過程中的技術發現。

### 8.1 MPA 架構下的 BroadcastChannel 同步缺陷

**問題**：從 SPA 遷移為 MPA（每個角色一個獨立 HTML 入口）後，廚房端修改菜單/庫存（如標記完售），顧客端和叫號端不會即時更新，需重新載入。

**原因**：
1. **廚房端缺少 broadcast 觸發**：InventoryPanel 和 MenuEditor 直接呼叫 Zustand store 的 action（如 `toggleSoldOut`、`updateMenuItem`），但這些 action 不會自動觸發 BroadcastChannel 廣播。之前 SPA 架構下所有元件共享同一個 Zustand store 實例，不需要跨分頁同步。
2. **Client 端缺少 BroadcastChannel 監聽器**：MPA 架構下每個頁面是獨立的 JavaScript 上下文，顧客端和叫號端的入口（`main-customer.tsx`、`main-queue.tsx`）沒有設置 BroadcastChannel 的 `onmessage` 監聽器。

**解決方案**：
1. **廚房端**：在 KitchenView 使用 `useMenuStore.subscribe()` 監聽 store 變化，當偵測到 menuItems 陣列變更時，自動呼叫 `broadcastInventorySync()` 和 `broadcastMenuSync()` 廣播給所有同裝置分頁。
2. **Client 端**：新增 `useBroadcastListener` hook，監聯 BroadcastChannel 的 `inventory-sync` 和 `menu-sync` 訊息類型，收到後更新本地 Zustand store。

**選擇理由**：
- 使用 `useMenuStore.subscribe()` 而非在每個 action 中手動呼叫 broadcast，因為這是「一處修改，全域生效」的模式，不會遺漏任何修改路徑。
- 將 BroadcastChannel 監聽邏輯封裝為獨立 hook（`useBroadcastListener`），而非嵌入各元件中，保持關注點分離。

### 8.2 SPA → MPA 遷移的關鍵考量

**問題**：原本的 SPA 架構使用 React Router 在單一頁面中切換視圖，改為 MPA 後每個角色有獨立入口（`/landing.html`、`/customer.html`、`/kitchen.html`、`/queue.html`）。

**遷移要點**：
- Vite 多入口配置：`build.rollupOptions.input` 指定多個 HTML 入口
- 每個入口檔有自己的 `main-*.tsx`，獨立掛載 React 根元件
- 跨頁面導航改為 `window.location.href` 或 `<a>` 標籤，不再使用 React Router
- **重要**：MPA 架構下，狀態管理（Zustand persist）透過 localStorage 共享，但 Zustand store 實例是獨立的。因此需要 BroadcastChannel 來通知其他分頁更新 store。

**選擇理由**：MPA 架構讓每個角色頁面可以獨立載入、獨立快取，適合現場點餐場景中不同裝置開啟不同頁面（如平板開廚房頁、手機開顧客頁、電視開叫號頁）。

---

### 7.5 日式裝飾圖案的 CSS 實現

**問題**：青海波（seigaiha）、雲紋等日式圖案傳統上使用圖片，但圖片會增加 bundle 大小且不易調整顏色。

**解決方案**：使用 CSS `background-image` 搭配 inline SVG data URI：
```css
.seigaiha-pattern {
  background-image: url("data:image/svg+xml,...");
  background-size: 56px 28px;
}
```

**優點**：
- 零額外網路請求（SVG 內嵌在 CSS 中）
- 顏色可透過修改 SVG 的 `stroke` 值即時調整
- 向量圖形在任何解析度都清晰
- 搭配 `opacity` 控制裝飾強度，不干擾內容閱讀

**注意**：SVG data URI 中的特殊字元（如 `#`、`%`）需要 URL encode。
