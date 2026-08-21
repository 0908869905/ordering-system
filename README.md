# 園遊會點餐系統（ordering-system）

> 為校慶園遊會自家攤位做的三端點餐系統：**顧客平板點餐 → 訂單即時推到後廚 → 完成後螢幕叫號＋語音播報**。三端跨裝置即時同步、不架自己的後端——裝置之間以 P2P 直連。

| | |
|---|---|
| 作者 | 李昌侑（Rick Lee） |
| 期間 | 2026/02（22 commits；前身為三個月前 1,496 行的單一巨型元件，此為重做版） |
| 狀態 | **完成・未上場**（見下方「一堂關於部署環境的課」） |
| 規模 | 5,268 行、50 個模組檔 |

## 做了什麼

- **三端、四入口（MPA）**：`index.html` 首頁 / `customer.html` 顧客端 / `kitchen.html` 廚房端 / `queue.html` 公共叫號螢幕——同一份程式碼、各自獨立載入
- **Single-Writer**：廚房端是全系統唯一的資料權威，顧客端與叫號端只讀；避免多端同時寫入造成狀態分歧
- **雙軌同步**：跨裝置走 PeerJS（WebRTC 資料通道），同裝置跨分頁走 `BroadcastChannel`，兩條路統一收斂到同一個處理層
- **交易 ID 冪等**：每筆訂單帶唯一 ID，重送不會重複下單（多裝置測試時踩到的問題）
- **庫存連動**：加購與即時庫存綁定、取消訂單自動歸還庫存；營收報表與歷史訂單
- **叫號與語音**：現正叫號大字、即將完成佇列、跑馬燈提示，號碼以 Web Speech API 自動播報

## 架構

```
customer.html ──┐                 ┌── queue.html（叫號螢幕）
                ├─ PeerJS (P2P) ──┤
kitchen.html ───┘  單一資料權威   └── 同裝置分頁：BroadcastChannel
        │
   Zustand store ── 訂單／庫存／營收
```

技術棧：Vite 6・React 19・TypeScript 5・Tailwind CSS 4・shadcn/ui・Zustand 5・PeerJS。

## 一堂關於部署環境的課

系統如期完成、多裝置測試通過；園遊會當天也架設了，但人潮讓現場行動網路完全壅塞，裝置之間始終建立不了連線——**它一整天沒能上場**。

原因其實寫在架構裡：P2P 不需要自己的後端，但裝置要先透過網路上的信令服務才找得到彼此；現場連那一步都過不了。我在隊伍的偵察系統做的是離線優先，這裡卻把「裝置如何找到彼此」交給了網路——**部署環境本身就是需求的一部分**。下次會先場勘、自架區域網路信令，或準備離線降級模式。

## 本機執行

```bash
npm install && npm run dev
# 開三個分頁：/customer.html、/kitchen.html、/queue.html 即可在同一台機器上完整試玩
```

## 開發方式（AI 協作聲明）

本專案以「與 AI 結對開發」完成：需求定義、三端架構與同步策略設計、多裝置驗證由我負責，程式碼由我與 AI（Claude Code）協作產出；每個模組做什麼、為什麼選這個方案、哪裡會失效，由我判斷並負責。`PROGRESS.md`／`FINDINGS.md`／`ERROR.md`／`TESTING.md` 為開發期間的真實工作紀錄。

## 相關專案

[科展・電腦視覺計分](https://github.com/0908869905/scoring-analyzer) ・ [影像標註平台](https://github.com/0908869905/frc-train-review) ・ [偵察 App](https://github.com/0908869905/frc-scouting-pass) ・ [偵察掃描與 OPR](https://github.com/0908869905/frc-scout-scanner) ・ [報帳系統](https://github.com/0908869905/frc-expense-money) ・ [台灣手語影音辭典](https://github.com/0908869905/tsl-sign-dictionary)
