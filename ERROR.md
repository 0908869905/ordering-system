# 現場點餐系統 - 錯誤記錄

此檔案記錄本專案特有的錯誤（通用錯誤請記錄到 `~/.claude/ERROR_LOG.md`）

---

## 2026-02-20: MPA 跨分頁即時同步失效

### 症狀
廚房端修改菜單/庫存（如標記品項完售）後，同裝置的顧客頁面和叫號頁面不會即時反映變更，需手動重新載入才會更新。

### 原因
SPA → MPA 遷移後，每個頁面是獨立的 JavaScript 上下文，Zustand store 實例獨立：
1. 廚房端的 InventoryPanel/MenuEditor 直接修改 Zustand store action，但這些 action 不會觸發 BroadcastChannel 廣播
2. 顧客端/叫號端入口沒有 BroadcastChannel `onmessage` 監聽器

### 解決
1. KitchenView 加入 `useMenuStore.subscribe()` — 自動偵測 store 變化並觸發 `broadcastInventorySync()` / `broadcastMenuSync()`
2. 新增 `useBroadcastListener` hook — Customer/Queue 入口掛載，監聽 inventory-sync / menu-sync 訊息

### 預防
- MPA 架構下，任何 store 變更若需跨分頁同步，**必須**透過 BroadcastChannel 廣播
- 新增頁面入口時，檢查是否需要掛載 `useBroadcastListener`
- 使用 `store.subscribe()` 模式而非在每個 action 中手動 broadcast，避免遺漏
