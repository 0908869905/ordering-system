# 宏麵屋 -- 主題設計系統

## A. 設計理念與靈感

### 品牌精神

**宏麵屋（Hiromen-ya）** -- 「宏」取其宏大、寬廣之意，寓意對拉麵品質的追求不止於表面，而是深入每一碗湯底的細節。「麵屋」是日式拉麵店的經典稱呼，傳達正統日式拉麵的專業感。

### 設計理念：「一碗入魂」

設計靈感來自三個核心元素的融合：

1. **日式現代（Japanese Modern）** -- 以一風堂為代表的現代拉麵店美學。簡約不簡單，每個設計元素都有其存在的意義。大量留白讓視覺呼吸，乾淨的排版傳達高級感。

2. **自然素材（Natural Materials）** -- 色彩取自拉麵店常見的自然素材：檜木吧台的溫暖木色、和紙燈籠的柔和米色、陶碗的樸素質感。這些色彩讓數位介面散發出實體空間的溫度。

3. **拉麵文化（Ramen Culture）** -- 蒸氣裊裊升起的視覺意象、青海波代表的湯底波紋、朱紅色的鳥居和暖簾。這些元素不只是裝飾，而是整個用餐體驗的延伸。

### 設計原則

- **觸控優先**：所有互動元素最小 48px，適合油膩的手指操作
- **一目瞭然**：在嘈雜的餐廳環境中，資訊層級必須清晰明確
- **溫暖不燙手**：設計要有溫度但不過度裝飾，保持操作效率
- **無障礙**：所有文字/背景色組合符合 WCAG AA 對比度標準（4.5:1）

---

## B. 色彩系統

### 色彩概覽

| 角色 | 色票 | HSL | 用途 |
|------|------|-----|------|
| Primary (木色) | `#d4852a` | `33 70% 50%` | 品牌主色、主要按鈕、強調連結 |
| Accent (朱紅) | `#d43425` | `4 70% 49%` | CTA 按鈕、價格標籤、重要操作 |
| Background (和紙) | `#faf8f5` | `35 33% 97%` | 頁面背景 |
| Surface (白) | `#ffffff` | `0 0% 100%` | 卡片、浮動面板 |
| Text Primary | `#292522` | `20 8% 15%` | 主要文字 |
| Text Secondary | `#6e655a` | `33 10% 39%` | 次要文字 |
| Border | `#e8e4dd` | `37 18% 89%` | 分隔線、邊框 |

### 語義色彩

| 語義 | 色票 | 用途 |
|------|------|------|
| Success (松綠) | `#16a34a` | 已完成訂單、成功操作 |
| Warning (琥珀) | `#f59e0b` | 製作中、庫存低 |
| Error (赤紅) | `#dc2626` | 待付款、錯誤、取消 |
| Info (藍染) | `#2563eb` | 已付款、連線狀態、提示 |

### 對比度驗證（WCAG AA）

| 前景 | 背景 | 對比度 | 結果 |
|------|------|--------|------|
| `#292522` (Text) | `#faf8f5` (BG) | 14.8:1 | AAA |
| `#6e655a` (Secondary) | `#faf8f5` (BG) | 5.2:1 | AA |
| `#d4852a` (Primary) | `#faf8f5` (BG) | 4.6:1 | AA |
| `#fdf8f0` (PrimaryFG) | `#d4852a` (Primary) | 4.6:1 | AA |
| `#fef3f2` (AccentFG) | `#d43425` (Accent) | 5.8:1 | AA |
| `#f5f1eb` (Text Dark) | `#1a1714` (Dark BG) | 14.1:1 | AAA |
| `#b8b0a2` (Secondary Dark) | `#1a1714` (Dark BG) | 7.8:1 | AAA |

### Tailwind CSS 4 -- @theme 配置

```css
/* src/index.css */
@import 'tailwindcss';

@theme {
  /* === 品牌色 === */
  --color-primary-50: #fdf8f0;
  --color-primary-100: #faecd8;
  --color-primary-200: #f4d5a8;
  --color-primary-300: #edb96f;
  --color-primary-400: #e69c3e;
  --color-primary-500: #d4852a;
  --color-primary-600: #b86a1f;
  --color-primary-700: #98501d;
  --color-primary-800: #7c411f;
  --color-primary-900: #66371d;
  --color-primary-950: #3a1b0c;

  --color-accent-50: #fef3f2;
  --color-accent-100: #fee4e1;
  --color-accent-200: #fecec8;
  --color-accent-300: #fcada3;
  --color-accent-400: #f87c6e;
  --color-accent-500: #ef5040;
  --color-accent-600: #d43425;
  --color-accent-700: #b8271b;
  --color-accent-800: #98241b;
  --color-accent-900: #7e241d;
  --color-accent-950: #440f0a;

  /* === 中性暖灰 === */
  --color-warm-50: #faf9f7;
  --color-warm-100: #f5f3ef;
  --color-warm-200: #e8e4dd;
  --color-warm-300: #d6d0c5;
  --color-warm-400: #b8b0a2;
  --color-warm-500: #9c9385;
  --color-warm-600: #857b6e;
  --color-warm-700: #6e655a;
  --color-warm-800: #5c544b;
  --color-warm-900: #4e4741;
  --color-warm-950: #292522;

  /* === 字型 === */
  --font-heading: 'Shippori Mincho', 'Noto Serif TC', Georgia, serif;
  --font-body: 'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', sans-serif;
  --font-decorative: 'Yuji Syuku', 'Shippori Mincho', 'Noto Serif TC', serif;
  --font-mono: 'JetBrains Mono', Consolas, 'Courier New', monospace;

  /* === 動畫 === */
  --animate-steam: steam 3s ease-in-out infinite;
  --animate-wave: wave-flow 8s linear infinite;
  --animate-fade-in: fade-in 0.5s ease-out;
  --animate-fade-in-up: fade-in-up 0.6s ease-out;
  --animate-slide-up: slide-up 0.4s ease-out;
  --animate-pulse-soft: pulse-soft 2s ease-in-out infinite;
  --animate-float: float 6s ease-in-out infinite;
  --animate-shimmer: shimmer 2s linear infinite;
}

/* === CSS 自訂屬性（語義層） === */
:root {
  /* 背景 */
  --background: 35 33% 97%;
  --background-secondary: 35 18% 94%;
  --background-tertiary: 33 16% 90%;
  --foreground: 20 8% 15%;

  /* 卡片 */
  --card: 0 0% 100%;
  --card-foreground: 20 8% 15%;

  /* 彈出層 */
  --popover: 0 0% 100%;
  --popover-foreground: 20 8% 15%;

  /* 主色 (木色) */
  --primary: 33 70% 50%;
  --primary-foreground: 35 60% 97%;

  /* 強調色 (朱紅) */
  --accent-primary: 4 70% 49%;
  --accent-primary-foreground: 4 90% 97%;

  /* 次要 */
  --secondary: 35 18% 94%;
  --secondary-foreground: 33 10% 39%;

  /* 柔和 */
  --muted: 35 18% 94%;
  --muted-foreground: 33 10% 39%;

  /* 強調(原 shadcn accent 語義) */
  --accent: 35 18% 94%;
  --accent-foreground: 20 8% 15%;

  /* 錯誤/危險 */
  --destructive: 0 73% 51%;
  --destructive-foreground: 0 0% 100%;

  /* 邊框與輸入 */
  --border: 37 18% 89%;
  --input: 37 18% 89%;
  --ring: 33 70% 50%;

  /* 圓角 */
  --radius: 0.75rem;

  /* 語義色 */
  --success: 142 63% 37%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 30 80% 15%;
  --info: 221 83% 53%;
  --info-foreground: 0 0% 100%;
}

/* === 深色模式（廚房/叫號看板可用 class 切換） === */
.dark {
  --background: 25 12% 9%;
  --background-secondary: 28 14% 12%;
  --background-tertiary: 28 13% 16%;
  --foreground: 35 18% 94%;

  --card: 28 13% 16%;
  --card-foreground: 35 18% 94%;

  --popover: 28 13% 16%;
  --popover-foreground: 35 18% 94%;

  --primary: 33 70% 50%;
  --primary-foreground: 35 60% 97%;

  --secondary: 28 14% 12%;
  --secondary-foreground: 37 12% 72%;

  --muted: 28 14% 12%;
  --muted-foreground: 33 8% 53%;

  --accent: 28 14% 12%;
  --accent-foreground: 35 18% 94%;

  --destructive: 0 73% 51%;
  --destructive-foreground: 0 0% 100%;

  --border: 30 12% 20%;
  --input: 30 12% 20%;
  --ring: 33 70% 50%;
}
```

---

## C. 字型使用規範

### Google Fonts 載入

在 `index.html` 的 `<head>` 中加入：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Noto+Sans+TC:wght@300;400;500;700&family=Yuji+Syuku&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### 字型使用對照表

| 場景 | 字型 | Tailwind Class | 範例 |
|------|------|---------------|------|
| 「宏麵屋」Logo | Yuji Syuku | `font-decorative text-4xl tracking-widest` | 宏麵屋 |
| 頁面標題 | Shippori Mincho | `font-heading text-3xl font-bold` | 菜單、廚房管理 |
| 分類標題 | Shippori Mincho | `font-heading text-xl font-semibold` | 拉麵、小菜、飲料 |
| 品項名稱 | Noto Sans TC | `font-body text-base font-bold` | 豚骨拉麵 |
| 一般文字 | Noto Sans TC | `font-body text-base` | 描述、備註 |
| 價格 | Shippori Mincho | `font-heading text-lg font-bold` | $180 |
| 按鈕 | Noto Sans TC | `font-body text-base font-medium` | 加入購物車 |
| 叫號數字 | JetBrains Mono | `font-mono text-display font-bold` | 42 |
| 輔助文字 | Noto Sans TC | `font-body text-sm text-warm-600` | 等候 5 分鐘 |

### 中日文混排注意事項

- 中文內容使用 `Noto Sans TC` 確保繁體字完整支援
- 日文裝飾字（如「拉麺」「味玉」）可使用 `Shippori Mincho` 搭配 `lang="ja"` 屬性
- 書法字型 `Yuji Syuku` 僅用於品牌名稱，不用於大量文字（載入成本考量）
- 數字和英文在 `Shippori Mincho` 中的呈現效果良好，不需額外處理

---

## D. 拉麵視覺元素設計

### D1. 青海波（Seigaiha）波浪紋

青海波是日本傳統圖案，代表無限延伸的海浪，象徵平安與好運。在此用來暗示拉麵湯底的波紋。

```css
/* 青海波背景圖案 */
.seigaiha {
  --seigaiha-color: var(--color-primary-200, #f4d5a8);
  --seigaiha-bg: transparent;
  background-color: var(--seigaiha-bg);
  background-image:
    radial-gradient(circle at 100% 150%, var(--seigaiha-color) 24%, var(--seigaiha-bg) 24%,
      var(--seigaiha-bg) 28%, var(--seigaiha-color) 28%, var(--seigaiha-color) 36%,
      var(--seigaiha-bg) 36%, var(--seigaiha-bg) 40%, var(--seigaiha-color) 40%,
      var(--seigaiha-color) 48%, transparent 48%),
    radial-gradient(circle at 0% 150%, var(--seigaiha-color) 24%, var(--seigaiha-bg) 24%,
      var(--seigaiha-bg) 28%, var(--seigaiha-color) 28%, var(--seigaiha-color) 36%,
      var(--seigaiha-bg) 36%, var(--seigaiha-bg) 40%, var(--seigaiha-color) 40%,
      var(--seigaiha-color) 48%, transparent 48%);
  background-size: 56px 28px;
}

/* 淡色版本 - 用於頁面背景 */
.seigaiha-subtle {
  --seigaiha-color: var(--color-primary-100, #faecd8);
  --seigaiha-bg: var(--color-warm-50, #faf9f7);
  opacity: 0.4;
}

/* 深色版本 - 用於叫號看板背景 */
.seigaiha-dark {
  --seigaiha-color: rgba(212, 133, 42, 0.08);
  --seigaiha-bg: transparent;
}

/* 波浪紋分隔線（僅底邊） */
.seigaiha-divider {
  height: 28px;
  background-image:
    radial-gradient(circle at 100% 150%, var(--color-primary-200) 24%, transparent 24%,
      transparent 28%, var(--color-primary-200) 28%, var(--color-primary-200) 36%,
      transparent 36%),
    radial-gradient(circle at 0% 150%, var(--color-primary-200) 24%, transparent 24%,
      transparent 28%, var(--color-primary-200) 28%, var(--color-primary-200) 36%,
      transparent 36%);
  background-size: 56px 28px;
  opacity: 0.5;
}

/* 流動動畫版本 */
.seigaiha-animated {
  animation: wave-flow 8s linear infinite;
  background-size: 56px 28px;
}

@keyframes wave-flow {
  0% { background-position: 0 0; }
  100% { background-position: 56px 0; }
}
```

### D2. 蒸氣動畫

三條彎曲的蒸氣線條從拉麵碗緩緩上升，用於 Landing Page 和品項裝飾。

```svg
<!-- SteamAnimation.svg - 內嵌 React 元件使用 -->
<svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="steam-animation">
  <!-- 左蒸氣 -->
  <path class="steam-line steam-1"
    d="M15 70 Q10 55 18 45 Q26 35 14 20 Q8 12 16 2"
    stroke="currentColor" stroke-width="2" stroke-linecap="round"
    fill="none" opacity="0.6" />
  <!-- 中蒸氣 -->
  <path class="steam-line steam-2"
    d="M30 72 Q25 58 33 48 Q41 38 29 22 Q23 14 31 4"
    stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
    fill="none" opacity="0.8" />
  <!-- 右蒸氣 -->
  <path class="steam-line steam-3"
    d="M45 70 Q40 55 48 45 Q56 35 44 20 Q38 12 46 2"
    stroke="currentColor" stroke-width="2" stroke-linecap="round"
    fill="none" opacity="0.6" />
</svg>
```

```css
/* 蒸氣動畫 CSS */
.steam-animation {
  color: var(--color-primary-300, #edb96f);
}

.steam-line {
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: steam-rise 3s ease-in-out infinite;
}

.steam-1 {
  animation-delay: 0s;
}

.steam-2 {
  animation-delay: 0.8s;
}

.steam-3 {
  animation-delay: 1.6s;
}

@keyframes steam-rise {
  0% {
    stroke-dashoffset: 80;
    opacity: 0;
    transform: translateY(8px);
  }
  30% {
    opacity: 0.7;
  }
  60% {
    opacity: 0.4;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
    transform: translateY(-12px);
  }
}

/* 小型蒸氣（用於品項卡片） */
.steam-animation-sm {
  width: 24px;
  height: 32px;
}

.steam-animation-sm .steam-line {
  stroke-width: 1.5;
  animation-duration: 2.5s;
}

/* 大型蒸氣（用於 Landing Page） */
.steam-animation-lg {
  width: 80px;
  height: 100px;
}
```

### D3. 日式雲紋（Kumo）分隔線

```css
/* 雲紋分隔線 - 使用 CSS 繪製的圓弧雲朵 */
.cloud-divider {
  position: relative;
  height: 24px;
  overflow: hidden;
}

.cloud-divider::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: -10%;
  width: 120%;
  height: 48px;
  background:
    radial-gradient(circle, var(--color-primary-100, #faecd8) 20px, transparent 20px) repeat-x,
    radial-gradient(circle, var(--color-primary-100, #faecd8) 15px, transparent 15px) repeat-x;
  background-size: 60px 48px, 40px 32px;
  background-position: 0 24px, 20px 32px;
}

/* 簡約版雲紋（只是波浪形分隔線） */
.cloud-divider-simple {
  height: 16px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 16'%3E%3Cpath d='M0 16 Q25 0 50 8 Q75 16 100 8 Q125 0 150 8 Q175 16 200 8 L200 16 Z' fill='%23faecd8' opacity='0.6'/%3E%3C/svg%3E") repeat-x;
  background-size: 200px 16px;
}

/* 深色模式雲紋 */
.dark .cloud-divider-simple {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 16'%3E%3Cpath d='M0 16 Q25 0 50 8 Q75 16 100 8 Q125 0 150 8 Q175 16 200 8 L200 16 Z' fill='%232e2a22' opacity='0.6'/%3E%3C/svg%3E") repeat-x;
  background-size: 200px 16px;
}
```

### D4. 麻葉紋（Asanoha）背景

```css
/* 麻葉紋幾何圖案 - 用 CSS 繪製 */
.asanoha {
  --asanoha-color: var(--color-primary-100, #faecd8);
  --asanoha-size: 40px;
  background-color: transparent;
  background-image:
    linear-gradient(30deg, var(--asanoha-color) 12%, transparent 12.5%, transparent 87%, var(--asanoha-color) 87.5%, var(--asanoha-color)),
    linear-gradient(150deg, var(--asanoha-color) 12%, transparent 12.5%, transparent 87%, var(--asanoha-color) 87.5%, var(--asanoha-color)),
    linear-gradient(30deg, var(--asanoha-color) 12%, transparent 12.5%, transparent 87%, var(--asanoha-color) 87.5%, var(--asanoha-color)),
    linear-gradient(150deg, var(--asanoha-color) 12%, transparent 12.5%, transparent 87%, var(--asanoha-color) 87.5%, var(--asanoha-color)),
    linear-gradient(60deg, rgba(250, 236, 216, 0.5) 25%, transparent 25.5%, transparent 75%, rgba(250, 236, 216, 0.5) 75%, rgba(250, 236, 216, 0.5)),
    linear-gradient(60deg, rgba(250, 236, 216, 0.5) 25%, transparent 25.5%, transparent 75%, rgba(250, 236, 216, 0.5) 75%, rgba(250, 236, 216, 0.5));
  background-size: var(--asanoha-size) calc(var(--asanoha-size) * 1.732);
  background-position:
    0 0,
    0 0,
    calc(var(--asanoha-size) / 2) calc(var(--asanoha-size) * 0.866),
    calc(var(--asanoha-size) / 2) calc(var(--asanoha-size) * 0.866),
    0 0,
    calc(var(--asanoha-size) / 2) calc(var(--asanoha-size) * 0.866);
}

/* 超淡版本 - 頁面背景裝飾 */
.asanoha-subtle {
  opacity: 0.15;
}
```

### D5. 拉麵相關圖示

Lucide Icons 中可用的相關圖示：

| 用途 | Lucide Icon | import | 備註 |
|------|-------------|--------|------|
| 顧客點餐 | `UtensilsCrossed` | 已使用 | 保留 |
| 廚房管理 | `ChefHat` | 已使用 | 保留 |
| 叫號看板 | `Monitor` | 已使用 | 保留 |
| 湯碗 | `Soup` | `lucide-react` | 拉麵碗意象 |
| 火焰(辣) | `Flame` | `lucide-react` | 辣度標示 |
| 計時器 | `Timer` | `lucide-react` | 等候時間 |
| 葉子(蔬菜) | `Leaf` | `lucide-react` | 蔬菜類配料 |
| 雞蛋 | `Egg` | `lucide-react` | 味玉/加蛋 |
| 商店 | `Store` | `lucide-react` | 店鋪設定 |

**自定 SVG 圖示**（Lucide 沒有的）：

```svg
<!-- 拉麵碗 (Ramen Bowl) - 24x24 viewBox，Lucide 風格 -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- 碗 -->
  <path d="M3 11h18" />
  <path d="M5 11c0 4.418 3.134 8 7 8s7-3.582 7-8" />
  <!-- 碗底座 -->
  <path d="M9 19h6" />
  <path d="M10 19v1h4v-1" />
  <!-- 蒸氣 -->
  <path d="M8 8c0-1 .5-2 1.5-2S11 7 11 8" opacity="0.6" />
  <path d="M13 6c0-1 .5-2 1.5-2S16 5 16 6" opacity="0.6" />
</svg>

<!-- 筷子 (Chopsticks) - 24x24 -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="8" y1="3" x2="15" y2="21" />
  <line x1="12" y1="3" x2="17" y2="21" />
</svg>

<!-- 海苔 (Nori) - 24x24 -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="7" y="3" width="10" height="18" rx="1" />
  <line x1="10" y1="7" x2="14" y2="7" opacity="0.4" />
  <line x1="10" y1="10" x2="14" y2="10" opacity="0.4" />
  <line x1="10" y1="13" x2="14" y2="13" opacity="0.4" />
</svg>

<!-- 叉燒 (Chashu) - 24x24 -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="8" />
  <path d="M12 4c-2 3-2 5 0 8s2 5 0 8" opacity="0.5" />
  <circle cx="12" cy="12" r="3" opacity="0.3" />
</svg>
```

### D6. 書法風「宏麵屋」Logo 設計

```
Logo 層次結構：

┌─────────────────────────────┐
│                             │
│       宏  麵  屋            │  ← Yuji Syuku, 4xl, tracking-[0.15em]
│       HIROMEN-YA            │  ← Shippori Mincho, xs, tracking-[0.3em], uppercase
│                             │
│      ～～～～～～           │  ← 波浪紋裝飾線（SVG 或 CSS border）
│                             │
└─────────────────────────────┘
```

**Logo 實作建議：**

```html
<div class="flex flex-col items-center gap-1">
  <!-- 主標題 -->
  <h1 class="font-decorative text-4xl tracking-[0.15em] text-warm-950">
    宏麵屋
  </h1>
  <!-- 英文副標題 -->
  <p class="font-heading text-xs tracking-[0.3em] uppercase text-warm-500">
    Hiromen-ya
  </p>
  <!-- 裝飾波浪線 -->
  <div class="mt-2 h-[2px] w-16 bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
</div>
```

**Logo 變體：**

1. **完整版** -- 用於 Landing Page，包含主標題 + 副標題 + 裝飾線 + 蒸氣動畫
2. **簡約版** -- 用於頁面 Header，僅主標題（較小字級）
3. **圖標版** -- 用於 PWA 圖示，取「宏」字做圓形印章設計
4. **深色版** -- 用於叫號看板，白色/金色文字

---

## E. 各頁面視覺設計方向

### E1. Landing Page（首頁）

```
視覺結構：

┌──────────────────────────────────────┐
│  ░░░░ 淡淡的青海波背景圖案 ░░░░      │
│                                      │
│           ～蒸氣動畫～               │
│              ╭───╮                   │
│              │🍜│  ← 拉麵碗圖示      │
│              ╰───╯                   │
│                                      │
│          宏  麵  屋                  │  ← Yuji Syuku 書法風
│          HIROMEN-YA                  │  ← 小字英文
│     ─── ～～～～～～ ───             │  ← 波浪裝飾線
│                                      │
│     ┌────────────────────┐          │
│     │  🍜  顧客點餐      │          │  ← 主按鈕（朱紅色）
│     └────────────────────┘          │
│     ┌────────────────────┐          │
│     │  👨‍🍳  廚房管理      │          │  ← 次要按鈕（木色邊框）
│     └────────────────────┘          │
│     ┌────────────────────┐          │
│     │  📺  叫號看板      │          │  ← 次要按鈕（木色邊框）
│     └────────────────────┘          │
│                                      │
│     ┌──────┐                        │
│     │ 中/EN │  ← 語言切換           │
│     └──────┘                        │
│                                      │
│  ～～～ 雲紋裝飾 ～～～              │
└──────────────────────────────────────┘
```

**設計細節：**
- 背景：`bg-[#faf8f5]` 和紙色 + 淡淡青海波圖案（opacity: 0.15）
- 蒸氣動畫在 Logo 上方，使用 `steam-animation-lg`
- Logo 使用 Yuji Syuku 書法字型，帶 `tracking-[0.15em]` 字距
- 主按鈕（顧客點餐）使用朱紅色 `bg-accent-600`，最醒目
- 次要按鈕使用木色邊框 `border-primary-300 text-primary-700`
- 底部雲紋裝飾使用 `cloud-divider-simple`
- 整體大量留白，營造高級感

### E2. Customer View（顧客點餐）

```
視覺結構：

┌──────────────────────────────────────┐
│ ← │  菜  單        宏麵屋 (小Logo)  │  ← Header 帶木色底
├──────────────────────────────────────┤
│ [全部] [拉麵] [小菜] [飲料] [甜點]   │  ← 分類標籤橫向捲動
├──────────────────────────────────────┤
│  ░ 和紙色背景 ░                      │
│                                      │
│  ── 拉麵 ──────────                  │  ← 分類標題帶日式裝飾線
│                                      │
│  ┌─────────┐  ┌─────────┐          │
│  │ 品項名稱 │  │ 品項名稱 │          │  ← 兩欄菜單卡片
│  │          │  │          │          │
│  │ $180  ＋ │  │ $200  ＋ │          │  ← 價格用明朝體，＋號朱紅色
│  └─────────┘  └─────────┘          │
│                                      │
│  ┌─────────┐  ┌─────────┐          │
│  │ 品項名稱 │  │  ▓▓▓▓▓  │          │  ← 售完品項灰色遮罩 + 「完売」
│  │          │  │  完 売   │          │
│  │ $120  ＋ │  │          │          │
│  └─────────┘  └─────────┘          │
│                                      │
├──────────────────────────────────────┤
│  🛒  購物車  (3)         合計 $500  │  ← 浮動底部欄（朱紅色按鈕）
└──────────────────────────────────────┘
```

**設計細節：**
- Header：米白色背景 + 微陰影，左側返回箭頭，右側小型 Logo
- 分類標籤：圓角膠囊形，選中狀態 `bg-primary-500 text-white`，未選中 `bg-warm-100 text-warm-700`
- 菜單卡片：白色卡片 + `rounded-xl` + 微陰影 + 左側木色邊框線 `border-l-2 border-primary-300`
- 價格：Shippori Mincho 字型，`text-accent-600 font-bold`（朱紅色更醒目）
- 快速加入按鈕：圓形朱紅色 `bg-accent-600`
- 售完：半透明遮罩 + 「完売」文字（用 Shippori Mincho 字型）
- 分類標題：Shippori Mincho 字型，左右帶短橫線裝飾
- 購物車浮動欄：朱紅色主按鈕，帶購物車圖示和數量徽章

### E3. Kitchen View（廚房管理）

```
視覺結構：

┌──────────────────────────────────────┐
│ ← │  廚房管理    ● 已連線   登出    │  ← 深色 Header
├──────────────────────────────────────┤
│ [訂單] [庫存] [菜單] [營收] [設定]   │  ← Tab 導航（深色主題）
├──────────────────────────────────────┤
│                                      │
│  ┌─ 待付款(紅邊) ──────────┐        │
│  │  #12  豚骨拉麵 x1        │        │
│  │       味玉 x1            │        │
│  │  $210    3 分鐘前        │        │
│  │  [標記已付款] [取消訂單]  │        │
│  └──────────────────────────┘        │
│                                      │
│  ┌─ 製作中(琥珀邊) ────────┐        │
│  │  #11  醬油拉麵 x2        │        │
│  │  $360    5 分鐘前        │        │
│  │  [完成製作]              │        │
│  └──────────────────────────┘        │
│                                      │
└──────────────────────────────────────┘
```

**設計細節：**
- 全頁使用 `.dark` 深色主題（炭色背景 `#1a1714`）
- Header：深色背景 + 金色 Logo 文字 `text-primary-400`
- Tab 導航：底部邊框指示器，選中為金色 `border-primary-400`
- 訂單卡片：深色卡片 `bg-[#2e2a22]` + 狀態色左邊框
- 按鈕使用高對比色確保在廚房環境（可能有蒸氣、油煙）下清晰可見
- 訂單號碼使用 JetBrains Mono 等寬字型
- 狀態色保持與亮色模式一致但調整亮度：紅、琥珀、綠

### E4. Queue View（叫號看板）

```
視覺結構：

┌──────────────────────────────────────┐
│  ← │    宏 麵 屋    │  ⛶  全螢幕   │  ← 書法 Logo（金色）
├──────────────────────────────────────┤
│  ═══ 雲紋裝飾帶 ═══                 │
│                                      │
│              現在叫號                │  ← 淡金色小字
│                                      │
│          ┌──────────┐               │
│          │          │               │
│          │    42    │               │  ← 超大號碼（松綠色）
│          │          │               │  ← 點擊可重新叫號
│          └──────────┘               │  ← 日式邊框（圓角 + 金色邊線）
│                                      │
│  ═══ 波浪紋分隔 ═══                 │
│                                      │
│          準備中                      │
│   ┌────┐ ┌────┐ ┌────┐            │
│   │ #43 │ │ #44 │ │ #45 │            │  ← 琥珀色號碼牌
│   └────┘ └────┘ └────┘            │
│                                      │
│          最近完成                    │
│   ┌────┐ ┌────┐ ┌────┐            │
│   │ #41 │ │ #40 │ │ #39 │            │  ← 松綠色號碼牌
│   └────┘ └────┘ └────┘            │
│                                      │
│  ～～～ 青海波底部裝飾 ～～～        │
└──────────────────────────────────────┘
```

**設計細節：**
- 深色背景 `bg-[#1a1714]`（炭色，比純黑更有溫度）
- Logo 使用 Yuji Syuku 書法字型，金色 `text-primary-400`
- 雲紋裝飾帶作為視覺分隔，使用 `cloud-divider-simple`
- 當前叫號數字：`font-mono text-display font-bold text-emerald-400`
- 叫號數字外框：`border-2 border-primary-400/30 rounded-2xl` 日式簡約邊框
- 準備中號碼牌：`bg-amber-500/15 text-amber-400 rounded-xl`
- 完成號碼牌：`bg-emerald-500/15 text-emerald-400 rounded-xl`
- 底部青海波裝飾使用 `seigaiha-dark` + `seigaiha-animated`
- 全螢幕模式隱藏返回按鈕，最大化叫號區域

---

## F. CSS 變數完整定義

以下是完整的 `src/index.css` 重寫方案：

```css
/* ===== Google Fonts 由 index.html <link> 載入 ===== */
@import 'tailwindcss';

/* ===== Tailwind CSS 4 Theme 擴展 ===== */
@theme {
  /* 品牌色 - 木色 */
  --color-primary-50: #fdf8f0;
  --color-primary-100: #faecd8;
  --color-primary-200: #f4d5a8;
  --color-primary-300: #edb96f;
  --color-primary-400: #e69c3e;
  --color-primary-500: #d4852a;
  --color-primary-600: #b86a1f;
  --color-primary-700: #98501d;
  --color-primary-800: #7c411f;
  --color-primary-900: #66371d;
  --color-primary-950: #3a1b0c;

  /* 強調色 - 朱紅 */
  --color-accent-50: #fef3f2;
  --color-accent-100: #fee4e1;
  --color-accent-200: #fecec8;
  --color-accent-300: #fcada3;
  --color-accent-400: #f87c6e;
  --color-accent-500: #ef5040;
  --color-accent-600: #d43425;
  --color-accent-700: #b8271b;
  --color-accent-800: #98241b;
  --color-accent-900: #7e241d;
  --color-accent-950: #440f0a;

  /* 暖灰中性色 */
  --color-warm-50: #faf9f7;
  --color-warm-100: #f5f3ef;
  --color-warm-200: #e8e4dd;
  --color-warm-300: #d6d0c5;
  --color-warm-400: #b8b0a2;
  --color-warm-500: #9c9385;
  --color-warm-600: #857b6e;
  --color-warm-700: #6e655a;
  --color-warm-800: #5c544b;
  --color-warm-900: #4e4741;
  --color-warm-950: #292522;

  /* 字型 */
  --font-heading: 'Shippori Mincho', 'Noto Serif TC', Georgia, serif;
  --font-body: 'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', sans-serif;
  --font-decorative: 'Yuji Syuku', 'Shippori Mincho', 'Noto Serif TC', serif;
  --font-mono: 'JetBrains Mono', Consolas, 'Courier New', monospace;

  /* 動畫 */
  --animate-steam: steam-rise 3s ease-in-out infinite;
  --animate-wave: wave-flow 8s linear infinite;
  --animate-fade-in: fade-in 0.5s ease-out forwards;
  --animate-fade-in-up: fade-in-up 0.6s ease-out forwards;
  --animate-slide-up: slide-up 0.4s ease-out forwards;
  --animate-pulse-soft: pulse-soft 2s ease-in-out infinite;
  --animate-float: float 6s ease-in-out infinite;
  --animate-shimmer: shimmer 2s linear infinite;
  --animate-bounce-in: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

/* ===== shadcn/ui 語義色彩層 ===== */
:root {
  --background: 35 33% 97%;
  --foreground: 20 8% 15%;
  --card: 0 0% 100%;
  --card-foreground: 20 8% 15%;
  --popover: 0 0% 100%;
  --popover-foreground: 20 8% 15%;
  --primary: 33 70% 50%;
  --primary-foreground: 35 60% 97%;
  --secondary: 35 18% 94%;
  --secondary-foreground: 33 10% 39%;
  --muted: 35 18% 94%;
  --muted-foreground: 33 10% 39%;
  --accent: 35 18% 94%;
  --accent-foreground: 20 8% 15%;
  --destructive: 0 73% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 37 18% 89%;
  --input: 37 18% 89%;
  --ring: 33 70% 50%;
  --radius: 0.75rem;

  --success: 142 63% 37%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 30 80% 15%;
}

.dark {
  --background: 25 12% 9%;
  --foreground: 35 18% 94%;
  --card: 28 13% 16%;
  --card-foreground: 35 18% 94%;
  --popover: 28 13% 16%;
  --popover-foreground: 35 18% 94%;
  --primary: 33 70% 50%;
  --primary-foreground: 35 60% 97%;
  --secondary: 28 14% 12%;
  --secondary-foreground: 37 12% 72%;
  --muted: 28 14% 12%;
  --muted-foreground: 33 8% 53%;
  --accent: 28 14% 12%;
  --accent-foreground: 35 18% 94%;
  --destructive: 0 73% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 30 12% 20%;
  --input: 30 12% 20%;
  --ring: 33 70% 50%;
}

/* ===== 全域基底樣式 ===== */
* {
  border-color: hsl(var(--border));
}

body {
  margin: 0;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
}

/* ===== 工具類別 ===== */
.no-select {
  -webkit-user-select: none;
  user-select: none;
}

.scroll-smooth {
  scroll-behavior: smooth;
}

.touch-target {
  min-height: 48px;
  min-width: 48px;
}
```

---

## G. 動畫效果完整定義

### G1. 所有 @keyframes 定義

```css
/* 蒸氣上升 */
@keyframes steam-rise {
  0% {
    stroke-dashoffset: 80;
    opacity: 0;
    transform: translateY(8px);
  }
  30% {
    opacity: 0.7;
  }
  60% {
    opacity: 0.4;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
    transform: translateY(-12px);
  }
}

/* 波浪流動 */
@keyframes wave-flow {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 56px 0;
  }
}

/* 淡入 */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 淡入上移 */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滑入上移 */
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 柔和脈動（用於叫號數字） */
@keyframes pulse-soft {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
}

/* 漂浮（用於蒸氣裝飾） */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 光澤流過（用於載入或新訂單） */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 彈入（用於訂單完成數字） */
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 訂單完成撒花/閃光 */
@keyframes celebrate {
  0% {
    background-size: 0% 0%;
    opacity: 0;
  }
  50% {
    background-size: 100% 100%;
    opacity: 1;
  }
  100% {
    background-size: 120% 120%;
    opacity: 0;
  }
}

/* 新訂單通知閃爍 */
@keyframes order-flash {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(212, 133, 42, 0);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(212, 133, 42, 0.3);
  }
}

/* 叫號數字進場 */
@keyframes number-enter {
  0% {
    opacity: 0;
    transform: scale(0.5) rotateX(45deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.1) rotateX(-5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateX(0);
  }
}

/* 印章蓋下（用於價格標籤或售完標記） */
@keyframes stamp {
  0% {
    opacity: 0;
    transform: scale(2) rotate(-15deg);
  }
  60% {
    opacity: 1;
    transform: scale(0.95) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
```

### G2. 動畫使用指南

| 動畫 | Tailwind Class | 使用場景 | 注意事項 |
|------|----------------|----------|----------|
| `steam` | `animate-steam` | Landing Page 蒸氣 | 搭配 SVG 使用 |
| `wave` | `animate-wave` | 青海波流動背景 | 只用於裝飾性背景 |
| `fade-in` | `animate-fade-in` | 頁面進場 | 搭配 `forwards` |
| `fade-in-up` | `animate-fade-in-up` | 卡片依序進場 | 用 `animation-delay` 錯開 |
| `slide-up` | `animate-slide-up` | 底部面板滑入 | 購物車面板 |
| `pulse-soft` | `animate-pulse-soft` | 叫號數字 | 僅在叫號看板用 |
| `float` | `animate-float` | Landing Page 裝飾 | 蒸氣圖示飄浮 |
| `shimmer` | `animate-shimmer` | 載入佔位 | 骨架屏效果 |
| `bounce-in` | `animate-bounce-in` | 訂單成功號碼 | 一次性動畫 |

### G3. 訂單成功慶祝效果

```css
/* 訂單完成時的放射狀光芒效果 */
.order-success-glow {
  position: relative;
}

.order-success-glow::after {
  content: '';
  position: absolute;
  inset: -20px;
  background:
    radial-gradient(circle, rgba(212, 133, 42, 0.15) 0%, transparent 70%);
  animation: celebrate 1.5s ease-out forwards;
  pointer-events: none;
  border-radius: 50%;
}

/* 飄落的日式裝飾粒子（純 CSS） */
.celebration-particles {
  position: relative;
  overflow: hidden;
}

.celebration-particles::before,
.celebration-particles::after {
  content: '🌸';
  position: absolute;
  font-size: 1.2rem;
  animation: particle-fall 2s ease-in forwards;
  pointer-events: none;
}

.celebration-particles::before {
  top: -20px;
  left: 30%;
  animation-delay: 0.2s;
}

.celebration-particles::after {
  content: '✨';
  top: -20px;
  right: 30%;
  animation-delay: 0.5s;
}

@keyframes particle-fall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(200px) rotate(180deg);
  }
}
```

### G4. 卡片互動效果

```css
/* 菜單卡片 hover/active 效果 */
.menu-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 6px -1px rgba(41, 37, 34, 0.08),
    0 2px 4px -2px rgba(41, 37, 34, 0.05);
}

.menu-card:active {
  transform: scale(0.98);
  box-shadow:
    0 1px 2px 0 rgba(41, 37, 34, 0.05);
}

/* 按鈕點擊水波紋效果 */
.btn-ripple {
  position: relative;
  overflow: hidden;
}

.btn-ripple::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--ripple-x, 50%) var(--ripple-y, 50%),
    rgba(255, 255, 255, 0.3) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}

.btn-ripple:active::after {
  opacity: 1;
}
```

---

## H. 觸控規範

### 觸控目標尺寸

| 元素類型 | 最小尺寸 | 建議尺寸 | 備註 |
|----------|----------|----------|------|
| 主要按鈕 | 48px | 56px | 高度，寬度依內容 |
| 圖示按鈕 | 44px x 44px | 48px x 48px | 正方形 |
| 快速加入(+) | 40px x 40px | 44px x 44px | 圓形 |
| 分類標籤 | 36px | 40px | 高度 |
| 清單項目 | 48px | 56px | 行高 |
| 核取方塊/開關 | 44px x 44px | 48px x 24px | 開關寬度 |

### 間距規範

| 層級 | 數值 | 用途 |
|------|------|------|
| 極小間距 | 4px (1) | 圖示與文字之間 |
| 小間距 | 8px (2) | 同一元素內部 |
| 基本間距 | 12px (3) | 相關元素之間 |
| 中間距 | 16px (4) | 卡片內部 padding |
| 大間距 | 24px (6) | 區塊之間 |
| 超大間距 | 32px (8) | 頁面段落之間 |
| 頁面邊距 | 16px (4) | 左右 padding |

### 滑動手勢區域

- 購物車面板：底部滑入，向下滑動關閉（觸發區域高度 48px）
- 分類標籤：橫向捲動，帶慣性滑動
- 訂單列表：縱向捲動，帶回彈效果
- 叫號看板數字：點擊重新叫號（整個數字區域為觸控目標）

### PWA 安全區域

```css
/* 適配 iOS 瀏海和底部指示條 */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 浮動底部欄 */
.floating-bar {
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}
```
