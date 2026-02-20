# 宏麵屋 - P2P 多設備同步測試指引

## 前置準備

1. `npm run build && npm run preview` 啟動預覽伺服器
2. 確認區網內設備可透過 `http://<電腦IP>:4173` 存取
3. 準備至少 2 個設備/瀏覽器（可用同一電腦的不同瀏覽器代替）

---

## 1. 同裝置跨分頁同步（BroadcastChannel）

### 1.1 菜單同步
- [ ] 開啟 Kitchen 分頁 (`/kitchen.html`)，登入後修改一個品項的價格
- [ ] 開啟 Customer 分頁 (`/customer.html`)，確認價格即時更新
- [ ] 在 Kitchen 停售一個品項，確認 Customer 端該品項顯示「售完」

### 1.2 訂單同步
- [ ] 在 Customer 分頁下單
- [ ] 確認 Kitchen 分頁即時收到新訂單
- [ ] 在 Kitchen 更新訂單狀態為「製作中」→「已完成」
- [ ] 開啟 Queue 分頁 (`/queue.html`)，確認叫號看板即時更新

### 1.3 庫存同步
- [ ] 在 Kitchen 設定某品項庫存為 1
- [ ] 在 Customer 下單該品項，庫存歸零
- [ ] 確認 Customer 端該品項自動顯示「售完」

---

## 2. 跨裝置 P2P 同步（PeerJS）

### 2.1 連線建立
- [ ] 設備 A 開啟 Kitchen（作為 Host）
- [ ] 設備 B 開啟 Customer，確認右下角連線狀態圖示轉為「已連線」（綠色）
- [ ] 設備 B 開啟 Queue，確認同樣顯示已連線

### 2.2 即時資料同步
- [ ] 設備 A (Kitchen) 修改菜單品項，確認設備 B (Customer) 即時更新
- [ ] 設備 B 下單，確認設備 A 即時收到訂單
- [ ] 設備 A 完成訂單，確認設備 B 的 Queue 頁面即時叫號

### 2.3 狀態全量同步
- [ ] 先在 Kitchen 做若干菜單修改和訂單操作
- [ ] 再開啟一台新的 Customer 設備
- [ ] 確認新連線的設備自動收到完整的最新菜單和訂單資料（非空白）

---

## 3. 離線與重連場景

### 3.1 短暫斷線
- [ ] Customer 設備斷開 WiFi 5 秒後重連
- [ ] 確認自動重新建立 P2P 連線
- [ ] 確認重連後資料完整（不遺失斷線期間的變更）

### 3.2 Kitchen 重啟
- [ ] Kitchen 關閉分頁再重新開啟
- [ ] 確認 localStorage 中的菜單和訂單資料仍在（Zustand persist）
- [ ] Customer / Queue 重新連線後，確認資料同步正常

### 3.3 完全離線操作
- [ ] Customer 在離線時瀏覽菜單（PWA 快取）
- [ ] 確認離線時可以查看之前快取的菜單資料
- [ ] 重新上線後確認連線恢復

---

## 4. 密碼加鹽向下相容性驗證

### 4.1 舊密碼（無鹽）相容
- [ ] 清除 localStorage 中 `kitchen-settings` 的資料
- [ ] 手動設定 `passwordHash` 為無鹽的 SHA-256 hash（預設 1234 的 hash）：
  ```js
  // 在 Console 執行：
  localStorage.setItem('kitchen-settings', JSON.stringify({
    state: {
      passwordHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
      salt: '',
      language: 'zh'
    },
    version: 0
  }));
  ```
- [ ] 重新載入 Kitchen 頁面，用密碼 `1234` 登入
- [ ] 確認可以成功登入（向下相容無鹽模式）

### 4.2 新密碼（有鹽）正常運作
- [ ] 在 Kitchen 設定中更改密碼為新密碼
- [ ] 登出後用新密碼重新登入
- [ ] 確認登入成功，且 localStorage 中的 `salt` 欄位不為空

---

## 5. CSP 驗證

### 5.1 Content-Security-Policy 生效
- [ ] 開啟任一頁面，打開 DevTools Console
- [ ] 確認沒有 CSP 違規警告（除非是開發模式下 Vite 注入的腳本）
- [ ] 確認 Google Fonts 正常載入（字型渲染正確）
- [ ] 確認 PeerJS 連線不被阻擋（P2P 正常運作）

### 5.2 PWA 功能正常
- [ ] DevTools → Application → Manifest，確認圖示正確載入
- [ ] 確認 Service Worker 正常註冊
- [ ] 確認「安裝應用程式」選項可用（桌面/手機）

---

## 常見問題排查

| 症狀 | 可能原因 | 解決方式 |
|------|----------|----------|
| P2P 連線失敗 | 防火牆阻擋 WebRTC | 確認同一區網，嘗試關閉防火牆 |
| 叫號沒有聲音 | 瀏覽器音效政策 | 需先點擊頁面任意位置解鎖音效 |
| 菜單不同步 | BroadcastChannel 不支援 | 確認使用現代瀏覽器（Chrome 54+） |
| CSP 阻擋資源 | 政策過嚴 | 查看 Console 的 CSP 違規報告，調整對應指令 |
| PWA 圖示未更新 | Service Worker 快取 | 清除快取或等待自動更新 |
