# 宏麵屋 -- 元件設計規範

> 本文件定義所有 UI 元件的視覺規範與 Tailwind CSS class 建議，供實作時直接參考。

---

## 目錄

1. [按鈕系統](#1-按鈕系統)
2. [卡片系統](#2-卡片系統)
3. [導航系統](#3-導航系統)
4. [徽章/標籤](#4-徽章標籤)
5. [模態視窗](#5-模態視窗)
6. [表單元素](#6-表單元素)
7. [特殊元件](#7-特殊元件)
8. [頁面級元件](#8-頁面級元件)

---

## 1. 按鈕系統

### 1.1 Primary Button（主要按鈕 -- 朱紅色）

用於最重要的行動呼籲：送出訂單、確認操作。

```
外觀：朱紅底色 + 白色文字 + 微圓角 + 印章質感陰影
懸浮：略微上移 + 加深陰影
按下：輕微縮小 + 陰影收縮
停用：降低飽和度 + 半透明
```

```jsx
// Tailwind CSS Classes
<Button className="
  bg-accent-600 text-white
  hover:bg-accent-700 hover:-translate-y-0.5 hover:shadow-lg
  active:scale-[0.98] active:shadow-sm
  disabled:opacity-50 disabled:saturate-50 disabled:pointer-events-none
  transition-all duration-200
  font-body font-medium
  rounded-xl
  min-h-12
  shadow-md shadow-accent-600/20
" />
```

**尺寸變體：**

| 尺寸 | Class | 高度 | 用途 |
|------|-------|------|------|
| sm | `px-4 py-2 text-sm min-h-9` | 36px | 次要操作、標籤按鈕 |
| md | `px-6 py-2.5 text-base min-h-11` | 44px | 標準操作 |
| lg | `px-8 py-3 text-lg min-h-12` | 48px | 觸控主操作 |
| xl | `px-10 py-4 text-xl min-h-14` | 56px | Landing Page 主入口 |

### 1.2 Secondary Button（次要按鈕 -- 木色邊框）

用於次要操作：返回、廚房入口、取消。

```
外觀：透明底 + 木色邊框 + 木色文字
懸浮：填充淡木色底 + 文字加深
按下：輕微縮小
```

```jsx
<Button className="
  border-2 border-primary-300 text-primary-700
  bg-transparent
  hover:bg-primary-50 hover:border-primary-400
  active:scale-[0.98]
  disabled:opacity-50 disabled:pointer-events-none
  transition-all duration-200
  font-body font-medium
  rounded-xl
  min-h-12
" />
```

### 1.3 Ghost Button（幽靈按鈕）

用於低優先操作：語言切換、返回箭頭、輔助功能。

```jsx
<Button className="
  bg-transparent text-warm-600
  hover:bg-warm-100 hover:text-warm-900
  active:bg-warm-200
  transition-colors duration-150
  font-body font-medium
  rounded-lg
" />
```

### 1.4 Danger Button（危險按鈕）

用於破壞性操作：取消訂單、清空購物車、刪除品項。

```jsx
<Button className="
  bg-red-600 text-white
  hover:bg-red-700
  active:scale-[0.98]
  transition-all duration-200
  font-body font-medium
  rounded-xl
  min-h-12
" />
```

### 1.5 Icon Button（圖示按鈕）

用於單一圖示操作：返回、全螢幕、設定。

```jsx
<Button className="
  flex items-center justify-center
  w-11 h-11
  bg-transparent text-warm-600
  hover:bg-warm-100 hover:text-warm-900
  active:bg-warm-200
  transition-colors duration-150
  rounded-full
" />
```

### 1.6 Quick Add Button（快速加入圓形按鈕）

用於菜單品項的快速加入購物車。

```jsx
<button className="
  flex items-center justify-center
  w-10 h-10
  rounded-full
  bg-accent-600 text-white
  hover:bg-accent-700
  active:scale-90
  transition-all duration-200
  shadow-sm shadow-accent-600/20
">
  <Plus className="h-5 w-5" />
</button>
```

### 1.7 Tab Button（分頁按鈕 -- 廚房用）

```jsx
// 選中狀態
<button className="
  flex items-center gap-1.5
  px-4 py-3
  text-sm font-medium
  border-b-2 border-primary-400 text-primary-400
  transition-colors duration-200
" />

// 未選中狀態
<button className="
  flex items-center gap-1.5
  px-4 py-3
  text-sm font-medium
  text-warm-400 hover:text-warm-200
  border-b-2 border-transparent
  transition-colors duration-200
" />
```

---

## 2. 卡片系統

### 2.1 Menu Card（菜單品項卡片）

顧客點餐頁面的核心卡片。

```
外觀：白色底 + 左側木色邊線 + 大圓角 + 微陰影
懸浮：輕微上浮 + 陰影擴大
按下：輕微縮小
售完：灰色遮罩 + 「完売」印章
```

```jsx
<Card className="
  relative overflow-hidden
  bg-white
  border border-warm-200
  border-l-[3px] border-l-primary-300
  rounded-xl
  shadow-sm
  hover:shadow-md hover:-translate-y-0.5
  active:scale-[0.98]
  transition-all duration-200
  cursor-pointer
">
  <div className="p-4">
    {/* 品項名稱 - 使用 body 字型 */}
    <h3 className="font-body text-base font-bold text-warm-950">
      {name}
    </h3>

    {/* 描述 (可選) */}
    <p className="mt-1 text-sm text-warm-500 line-clamp-1">
      {description}
    </p>

    {/* 價格行 */}
    <div className="mt-3 flex items-center justify-between">
      {/* 價格 - 明朝體 + 朱紅色 */}
      <span className="font-heading text-lg font-bold text-accent-600">
        ${price}
      </span>

      {/* 快速加入按鈕 */}
      <QuickAddButton />
    </div>
  </div>
</Card>
```

**售完狀態覆蓋層：**

```jsx
{isSoldOut && (
  <div className="absolute inset-0 flex items-center justify-center bg-warm-950/40 backdrop-blur-[1px]">
    <span className="
      font-heading text-lg font-bold text-white
      border-2 border-white/60
      rounded-lg
      px-4 py-1.5
      rotate-[-8deg]
      shadow-lg
    ">
      完売
    </span>
  </div>
)}
```

### 2.2 Order Card（訂單卡片 -- 廚房用）

```
外觀：深色卡片底 + 左側狀態色粗邊框 + 圓角
新訂單：閃爍光暈效果
```

```jsx
<Card className={`
  bg-[#2e2a22]
  border border-[#3d372e]
  border-l-4
  rounded-xl
  overflow-hidden
  ${status === 'unpaid' ? 'border-l-red-500' : ''}
  ${status === 'preparing' ? 'border-l-amber-500' : ''}
  ${status === 'completed' ? 'border-l-emerald-500' : ''}
  ${isNew ? 'animate-[order-flash_1s_ease-in-out_2]' : ''}
`}>
  <div className="p-4">
    {/* 訂單號碼 */}
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-xl font-bold text-warm-100">
        #{orderNumber}
      </span>
      <span className="text-xs text-warm-500">
        {waitTime}
      </span>
    </div>

    {/* 品項列表 */}
    <div className="space-y-1.5 text-sm text-warm-300">
      {items.map(item => (
        <div key={item.id} className="flex justify-between">
          <span>{item.name} x{item.quantity}</span>
          <span className="text-warm-500">${item.subtotal}</span>
        </div>
      ))}
    </div>

    {/* 操作按鈕 */}
    <div className="mt-4 flex gap-2">
      {/* 按鈕依狀態顯示 */}
    </div>
  </div>
</Card>
```

### 2.3 Info Card（資訊卡片）

用於營收報表、設定面板等資訊呈現。

```jsx
<Card className="
  bg-warm-50
  border border-warm-200
  rounded-xl
  p-5
">
  <h3 className="font-heading text-lg font-semibold text-warm-900">
    {title}
  </h3>
  <p className="mt-1 text-3xl font-bold text-primary-600 font-heading">
    {value}
  </p>
  <p className="mt-1 text-sm text-warm-500">
    {subtitle}
  </p>
</Card>
```

### 2.4 Queue Number Card（叫號號碼牌）

```jsx
// 準備中 - 琥珀色
<div className="
  inline-flex items-center justify-center
  rounded-xl
  bg-amber-500/15
  border border-amber-500/30
  px-6 py-3
  text-2xl font-bold font-mono
  text-amber-400
  min-w-[80px]
">
  #{number}
</div>

// 已完成 - 松綠色（可點擊重叫）
<button className="
  inline-flex items-center justify-center
  rounded-xl
  bg-emerald-500/15
  border border-emerald-500/30
  px-5 py-2
  text-xl font-bold font-mono
  text-emerald-400
  hover:bg-emerald-500/25
  active:scale-95
  transition-all duration-200
  min-w-[72px]
">
  #{number}
</button>
```

---

## 3. 導航系統

### 3.1 Page Header（頁面頂部導航 -- 亮色模式）

用於顧客點餐頁面。

```jsx
<header className="
  sticky top-0 z-30
  flex items-center gap-3
  border-b border-warm-200
  bg-white/95 backdrop-blur-sm
  px-4 py-3
  shadow-sm
">
  {/* 返回按鈕 */}
  <Button variant="ghost" size="icon"
    className="text-warm-700 hover:bg-warm-100">
    <ArrowLeft />
  </Button>

  {/* 頁面標題 - 明朝體 */}
  <h1 className="flex-1 font-heading text-xl font-bold text-warm-950">
    {title}
  </h1>

  {/* 右側小型 Logo（可選） */}
  <span className="font-decorative text-sm text-primary-500 tracking-widest">
    宏麵屋
  </span>
</header>
```

### 3.2 Page Header（深色模式 -- 廚房/叫號）

```jsx
<header className="
  sticky top-0 z-30
  flex items-center gap-3
  border-b border-[#3d372e]
  bg-[#1a1714]/95 backdrop-blur-sm
  px-4 py-3
">
  <Button variant="ghost" size="icon"
    className="text-warm-300 hover:bg-white/10">
    <ArrowLeft />
  </Button>

  <h1 className="flex-1 font-heading text-lg font-bold text-primary-400">
    {title}
  </h1>
</header>
```

### 3.3 Category Tabs（分類標籤列 -- 顧客端）

```jsx
<div className="
  flex gap-2
  overflow-x-auto
  scrollbar-hide
  px-4 py-3
  bg-white
  border-b border-warm-100
">
  {/* 選中狀態 */}
  <button className="
    shrink-0
    px-5 py-2
    rounded-full
    bg-primary-500 text-white
    font-body text-sm font-medium
    shadow-sm shadow-primary-500/20
    transition-all duration-200
    min-h-9
  ">
    {category.name}
  </button>

  {/* 未選中狀態 */}
  <button className="
    shrink-0
    px-5 py-2
    rounded-full
    bg-warm-100 text-warm-600
    font-body text-sm font-medium
    hover:bg-warm-200 hover:text-warm-800
    active:scale-95
    transition-all duration-200
    min-h-9
  ">
    {category.name}
  </button>
</div>
```

### 3.4 Section Title with Japanese Decoration（日式分類標題）

```jsx
<div className="flex items-center gap-3 px-4 py-3">
  {/* 左裝飾線 */}
  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary-200" />

  {/* 分類名稱 - 明朝體 */}
  <h2 className="font-heading text-lg font-semibold text-warm-800 shrink-0">
    {categoryName}
  </h2>

  {/* 右裝飾線 */}
  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary-200" />
</div>
```

### 3.5 Kitchen Tab Bar（廚房分頁導航）

```jsx
<div className="
  flex
  overflow-x-auto
  scrollbar-hide
  border-b border-[#3d372e]
  bg-[#1a1714]
">
  {tabs.map(tab => (
    <button
      key={tab.id}
      className={`
        flex shrink-0 items-center gap-1.5
        px-4 py-3
        text-sm font-medium font-body
        transition-colors duration-200
        border-b-2
        ${activeTab === tab.id
          ? 'border-primary-400 text-primary-400'
          : 'border-transparent text-warm-500 hover:text-warm-300'
        }
      `}
    >
      {tab.icon}
      {tab.label}
    </button>
  ))}
</div>
```

---

## 4. 徽章/標籤

### 4.1 Order Status Badge（訂單狀態徽章）

```jsx
const statusStyles = {
  unpaid: 'bg-red-600 text-white',
  paid: 'bg-blue-600 text-white',
  preparing: 'bg-amber-500 text-amber-950',
  completed: 'bg-emerald-600 text-white',
  pickedUp: 'bg-warm-600 text-white',
  cancelled: 'bg-warm-400 text-white',
}

<Badge className={`
  ${statusStyles[status]}
  font-body text-xs font-bold
  px-2.5 py-0.5
  rounded-md
`}>
  {statusText}
</Badge>
```

### 4.2 Stock Warning Badge（庫存警告）

```jsx
<Badge className="
  bg-amber-100 text-amber-700
  border border-amber-300
  font-body text-[10px] font-bold
  px-1.5 py-0.5
  rounded-md
">
  {t.stock}: {stock}
</Badge>
```

### 4.3 Sold Out Badge（售完標記 -- 印章風格）

```jsx
<span className="
  font-heading text-base font-bold
  text-white
  border-2 border-white/60
  rounded-lg
  px-3 py-1
  rotate-[-8deg]
  shadow-lg
  animate-[stamp_0.3s_ease-out]
">
  完売
</span>
```

### 4.4 Cart Count Badge（購物車數量）

```jsx
<Badge className="
  bg-white/20 text-white
  font-body text-xs font-bold
  px-2 py-0.5
  rounded-full
  min-w-[20px] text-center
">
  {count}
</Badge>
```

### 4.5 New Item Badge（新品標記 -- 印章風格）

```jsx
<span className="
  absolute -top-1 -right-1
  bg-accent-600 text-white
  font-heading text-[10px] font-bold
  px-2 py-0.5
  rounded-md
  rotate-[5deg]
  shadow-sm
">
  新
</span>
```

### 4.6 Connection Status Badge（連線狀態）

```jsx
const connectionStyles = {
  connected: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  disconnected: 'bg-red-500/15 text-red-400 border-red-500/30',
  connecting: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

<span className={`
  inline-flex items-center gap-1.5
  px-2.5 py-1
  rounded-full
  border
  text-xs font-medium
  ${connectionStyles[state]}
`}>
  <span className={`
    w-2 h-2 rounded-full
    ${state === 'connected' ? 'bg-emerald-400' : ''}
    ${state === 'disconnected' ? 'bg-red-400' : ''}
    ${state === 'connecting' ? 'bg-amber-400 animate-pulse' : ''}
  `} />
  {label}
</span>
```

---

## 5. 模態視窗

### 5.1 Dialog（對話框 -- 和紙質感）

```jsx
{/* 背景遮罩 */}
<div className="
  fixed inset-0 z-50
  bg-warm-950/60 backdrop-blur-sm
  animate-fade-in
">
  {/* 對話框本體 */}
  <div className="
    fixed inset-x-4 top-1/2 -translate-y-1/2
    max-w-md mx-auto
    bg-[#faf8f5]
    border border-warm-200
    rounded-2xl
    shadow-2xl shadow-warm-950/10
    overflow-hidden
    animate-bounce-in
  ">
    {/* 頂部雲紋裝飾 */}
    <div className="cloud-divider-simple h-3 opacity-60" />

    {/* 標題 */}
    <div className="px-6 pt-4 pb-2">
      <h2 className="font-heading text-xl font-bold text-warm-950">
        {title}
      </h2>
    </div>

    {/* 內容 */}
    <div className="px-6 py-4">
      {children}
    </div>

    {/* 底部按鈕區 */}
    <div className="flex gap-3 px-6 py-4 border-t border-warm-200 bg-warm-50">
      <Button variant="ghost" className="flex-1">
        {cancelText}
      </Button>
      <Button variant="primary" className="flex-1">
        {confirmText}
      </Button>
    </div>

    {/* 底部雲紋裝飾 */}
    <div className="cloud-divider-simple h-3 opacity-60 rotate-180" />
  </div>
</div>
```

### 5.2 Bottom Sheet（底部滑入面板 -- 購物車用）

```jsx
{/* 背景遮罩 */}
<div className="
  fixed inset-0 z-50
  bg-warm-950/60 backdrop-blur-sm
  animate-fade-in
"
  onClick={onClose}
>
  {/* 面板 */}
  <div className="
    fixed inset-x-0 bottom-0
    max-h-[85dvh]
    bg-[#faf8f5]
    border-t border-warm-200
    rounded-t-3xl
    shadow-2xl
    overflow-hidden
    animate-slide-up
  "
    onClick={e => e.stopPropagation()}
  >
    {/* 拖曳把手 */}
    <div className="flex justify-center py-3">
      <div className="w-10 h-1 rounded-full bg-warm-300" />
    </div>

    {/* 標題列 */}
    <div className="flex items-center justify-between px-6 pb-3">
      <h2 className="font-heading text-xl font-bold text-warm-950">
        {title}
      </h2>
      <button onClick={onClose} className="text-warm-400 hover:text-warm-600">
        <X className="h-5 w-5" />
      </button>
    </div>

    {/* 可捲動內容區 */}
    <div className="overflow-y-auto px-6 pb-safe max-h-[calc(85dvh-180px)]">
      {children}
    </div>

    {/* 固定底部操作區 */}
    <div className="
      border-t border-warm-200
      bg-white
      px-6 py-4
      pb-[max(16px,env(safe-area-inset-bottom))]
    ">
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-warm-600">{t.total}</span>
        <span className="font-heading text-2xl font-bold text-accent-600">
          ${total}
        </span>
      </div>
      <Button size="lg" className="w-full bg-accent-600 text-white rounded-xl min-h-14 text-lg">
        {t.submitOrder}
      </Button>
    </div>
  </div>
</div>
```

### 5.3 Item Detail Modal（品項詳情 -- 選項選擇）

```jsx
<div className="
  fixed inset-x-0 bottom-0 z-50
  max-h-[90dvh]
  bg-[#faf8f5]
  rounded-t-3xl
  shadow-2xl
  overflow-hidden
  animate-slide-up
">
  {/* 品項標題區 */}
  <div className="relative px-6 pt-6 pb-4 bg-primary-50">
    {/* 關閉按鈕 */}
    <button className="absolute top-4 right-4 text-warm-400">
      <X />
    </button>

    {/* 品項名稱 - 明朝體大字 */}
    <h2 className="font-heading text-2xl font-bold text-warm-950">
      {item.name}
    </h2>
    {item.nameEn && (
      <p className="mt-1 text-sm text-warm-500">{item.nameEn}</p>
    )}
    <p className="mt-2 font-heading text-xl font-bold text-accent-600">
      ${item.price}
    </p>
  </div>

  {/* 選項列表 */}
  <div className="px-6 py-4 space-y-3">
    <h3 className="font-heading text-base font-semibold text-warm-800">
      {t.options}
    </h3>
    {item.options.map(option => (
      <label key={option.id} className="
        flex items-center gap-3
        p-3
        rounded-xl
        border border-warm-200
        hover:border-primary-300
        transition-colors
        cursor-pointer
        min-h-12
      ">
        <Checkbox />
        <span className="flex-1 font-body text-warm-900">{option.name}</span>
        <span className="font-heading text-sm font-bold text-primary-600">
          +${option.price}
        </span>
      </label>
    ))}
  </div>

  {/* 數量選擇 + 加入購物車 */}
  <div className="
    border-t border-warm-200 bg-white
    px-6 py-4
    pb-[max(16px,env(safe-area-inset-bottom))]
  ">
    {/* 數量控制 */}
    <div className="flex items-center justify-center gap-6 mb-4">
      <button className="
        w-12 h-12 rounded-full
        border-2 border-warm-300
        flex items-center justify-center
        text-warm-600 text-xl
        hover:border-primary-400 hover:text-primary-600
        active:scale-90
        transition-all
      ">
        -
      </button>
      <span className="font-mono text-2xl font-bold text-warm-950 min-w-[48px] text-center">
        {quantity}
      </span>
      <button className="
        w-12 h-12 rounded-full
        bg-primary-500 text-white
        flex items-center justify-center
        text-xl
        hover:bg-primary-600
        active:scale-90
        transition-all
      ">
        +
      </button>
    </div>

    <Button size="lg" className="
      w-full bg-accent-600 text-white
      rounded-xl min-h-14 text-lg
      shadow-md shadow-accent-600/20
    ">
      {t.addToCart} - ${subtotal}
    </Button>
  </div>
</div>
```

---

## 6. 表單元素

### 6.1 Text Input（文字輸入 -- 底線風格）

日式簡約的底線輸入框，聚焦時顯示木色底線。

```jsx
<div className="relative">
  <label className="
    block font-body text-sm font-medium text-warm-600 mb-1.5
  ">
    {label}
  </label>
  <input className="
    w-full
    px-3 py-3
    bg-transparent
    border-b-2 border-warm-200
    text-warm-950 font-body text-base
    placeholder:text-warm-400
    focus:border-primary-500 focus:outline-none
    transition-colors duration-200
    min-h-12
  "
    type="text"
    placeholder={placeholder}
  />
</div>
```

### 6.2 Textarea（多行輸入 -- 備註用）

```jsx
<textarea className="
  w-full
  px-3 py-3
  bg-warm-50
  border border-warm-200
  rounded-xl
  text-warm-950 font-body text-base
  placeholder:text-warm-400
  focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 focus:outline-none
  transition-all duration-200
  resize-none
  min-h-[80px]
" />
```

### 6.3 Quantity Stepper（數量選擇器 -- 加大觸控版）

```jsx
<div className="flex items-center gap-4">
  {/* 減少按鈕 */}
  <button className="
    w-12 h-12
    flex items-center justify-center
    rounded-full
    border-2 border-warm-300
    text-warm-600 text-lg font-bold
    hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50
    active:scale-90
    disabled:opacity-30 disabled:pointer-events-none
    transition-all duration-200
  "
    disabled={quantity <= 1}
  >
    <Minus className="w-5 h-5" />
  </button>

  {/* 數量顯示 */}
  <span className="
    font-mono text-xl font-bold text-warm-950
    min-w-[40px] text-center
  ">
    {quantity}
  </span>

  {/* 增加按鈕 */}
  <button className="
    w-12 h-12
    flex items-center justify-center
    rounded-full
    bg-primary-500 text-white text-lg font-bold
    hover:bg-primary-600
    active:scale-90
    transition-all duration-200
    shadow-sm shadow-primary-500/20
  ">
    <Plus className="w-5 h-5" />
  </button>
</div>
```

### 6.4 Select（下拉選擇 -- 日式簡約）

```jsx
<div className="relative">
  <label className="
    block font-body text-sm font-medium text-warm-600 mb-1.5
  ">
    {label}
  </label>
  <select className="
    w-full
    appearance-none
    px-3 py-3 pr-10
    bg-warm-50
    border border-warm-200
    rounded-xl
    text-warm-950 font-body text-base
    focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 focus:outline-none
    transition-all duration-200
    min-h-12
  ">
    {options}
  </select>
  {/* 自訂下拉箭頭 */}
  <ChevronDown className="
    absolute right-3 top-[calc(50%+8px)] -translate-y-1/2
    w-5 h-5 text-warm-400
    pointer-events-none
  " />
</div>
```

### 6.5 Toggle Switch（開關 -- 設定用）

```jsx
<button
  role="switch"
  aria-checked={enabled}
  className={`
    relative
    w-14 h-8
    rounded-full
    transition-colors duration-200
    ${enabled ? 'bg-primary-500' : 'bg-warm-300'}
  `}
  onClick={() => setEnabled(!enabled)}
>
  <span className={`
    absolute top-1 left-1
    w-6 h-6
    rounded-full
    bg-white
    shadow-sm
    transition-transform duration-200
    ${enabled ? 'translate-x-6' : 'translate-x-0'}
  `} />
</button>
```

### 6.6 Password Input（密碼輸入 -- 廚房登入）

```jsx
<div className="relative">
  <input
    type="password"
    className="
      w-full
      px-4 py-4
      bg-warm-50
      border-2 border-warm-200
      rounded-xl
      text-center text-2xl font-mono tracking-[0.5em]
      placeholder:text-warm-300 placeholder:tracking-normal placeholder:text-base
      focus:border-primary-500 focus:outline-none
      transition-colors duration-200
    "
    placeholder={t.password}
    inputMode="numeric"
  />
</div>
```

---

## 7. 特殊元件

### 7.1 SteamAnimation（蒸氣動畫元件）

```tsx
// src/components/shared/SteamAnimation.tsx
interface SteamAnimationProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// 尺寸對照
// sm: 24x32px  - 品項卡片用
// md: 40x52px  - 預設尺寸
// lg: 80x100px - Landing Page 用

const sizeMap = {
  sm: 'w-6 h-8',
  md: 'w-10 h-13',
  lg: 'w-20 h-25',
}

// 使用方式：
<SteamAnimation size="lg" className="text-primary-300" />
```

**SVG 內容已在 theme.md D2 節定義，元件僅是 SVG 的 React 封裝。**

### 7.2 WaveDivider（青海波分隔線元件）

```tsx
// src/components/shared/WaveDivider.tsx
interface WaveDividerProps {
  variant?: 'light' | 'dark' | 'subtle'
  animated?: boolean
  className?: string
}

// variant 對照：
// light: 用於亮色頁面（primary-200 色調）
// dark:  用於深色頁面（primary-400/10 色調）
// subtle: 極淡，用於背景裝飾

// 使用方式：
<WaveDivider variant="light" animated />
// 渲染為一個 28px 高的青海波圖案帶
```

**CSS 已在 theme.md D1 節定義。元件應用對應的 CSS class。**

```jsx
// 實作結構
<div className={`
  seigaiha-divider
  h-7
  ${animated ? 'seigaiha-animated' : ''}
  ${variant === 'dark' ? 'seigaiha-dark' : ''}
  ${variant === 'subtle' ? 'opacity-30' : 'opacity-50'}
  ${className}
`} />
```

### 7.3 CloudDivider（雲紋分隔線元件）

```tsx
// src/components/shared/CloudDivider.tsx
interface CloudDividerProps {
  variant?: 'simple' | 'full'
  className?: string
}

// simple: SVG 波浪形分隔線（16px 高）
// full:   多層圓弧雲朵（24px 高）

// 使用方式：
<CloudDivider variant="simple" />
```

**CSS 已在 theme.md D3 節定義。**

```jsx
// 實作結構
<div className={`
  ${variant === 'simple' ? 'cloud-divider-simple' : 'cloud-divider'}
  ${className}
`} />
```

### 7.4 AsanohaBackground（麻葉紋背景元件）

```tsx
// src/components/shared/AsanohaBackground.tsx
interface AsanohaBackgroundProps {
  opacity?: number  // 0-100，預設 15
  className?: string
  children?: React.ReactNode
}

// 使用方式（作為背景容器）：
<AsanohaBackground opacity={10}>
  <div>頁面內容</div>
</AsanohaBackground>
```

```jsx
// 實作結構
<div className={`relative ${className}`}>
  <div
    className="asanoha absolute inset-0 pointer-events-none"
    style={{ opacity: opacity / 100 }}
  />
  <div className="relative z-10">
    {children}
  </div>
</div>
```

### 7.5 JapaneseFrame（日式邊框裝飾）

用於叫號看板的主號碼區域或特殊強調區塊。

```tsx
// src/components/shared/JapaneseFrame.tsx

// 使用方式：
<JapaneseFrame>
  <span className="text-display font-mono font-bold text-emerald-400">
    42
  </span>
</JapaneseFrame>
```

```jsx
// 實作結構
<div className="
  relative
  inline-flex items-center justify-center
  p-8
">
  {/* 四角裝飾 */}
  <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary-400/40 rounded-tl-lg" />
  <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary-400/40 rounded-tr-lg" />
  <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary-400/40 rounded-bl-lg" />
  <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary-400/40 rounded-br-lg" />

  {children}
</div>
```

### 7.6 OrderSuccessView（訂單成功頁面）

訂單完成時的完整慶祝畫面。

```jsx
<div className="
  flex min-h-dvh flex-col items-center justify-center
  gap-6 p-6
  bg-[#faf8f5]
  animate-fade-in
">
  {/* 蒸氣動畫 */}
  <SteamAnimation size="lg" className="text-primary-300 animate-float" />

  {/* 拉麵碗圖示 */}
  <div className="relative">
    <RamenBowlIcon className="w-20 h-20 text-primary-500" />
    {/* 放射狀光芒 */}
    <div className="order-success-glow" />
  </div>

  {/* 成功文字 */}
  <h1 className="font-heading text-3xl font-bold text-warm-950 animate-fade-in-up">
    {t.orderSuccess}
  </h1>

  {/* 號碼 - 超大彈入 */}
  <div className="animate-bounce-in">
    <span className="font-mono text-6xl font-bold text-accent-600">
      #{orderNumber}
    </span>
  </div>

  {/* 提示文字 */}
  <p className="text-warm-500 font-body animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
    {t.pleasePayAt}
  </p>

  {/* 金額 */}
  <p className="font-heading text-2xl font-bold text-primary-600 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
    ${totalAmount}
  </p>

  {/* 操作按鈕 */}
  <div className="flex flex-col gap-3 w-full max-w-xs mt-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
    <Button size="lg" className="w-full bg-accent-600 text-white rounded-xl">
      {t.continueShopping}
    </Button>
    <Button size="lg" variant="ghost" className="w-full text-warm-600" onClick={onBackToHome}>
      {t.back}
    </Button>
  </div>

  {/* 底部波浪裝飾 */}
  <WaveDivider variant="subtle" className="absolute bottom-0 left-0 right-0" />
</div>
```

### 7.7 FloatingCartBar（浮動購物車欄）

```jsx
<div className="
  fixed bottom-0 left-0 right-0 z-40
  pb-[max(12px,env(safe-area-inset-bottom))]
  px-3 pt-3
  bg-white/95 backdrop-blur-sm
  border-t border-warm-200
  shadow-[0_-4px_12px_rgba(41,37,34,0.08)]
  animate-slide-up
">
  <Button
    className="
      w-full min-h-14
      bg-accent-600 text-white
      rounded-xl
      text-lg font-medium
      shadow-md shadow-accent-600/20
      flex items-center justify-between px-5
      hover:bg-accent-700
      active:scale-[0.98]
      transition-all duration-200
    "
    onClick={() => setShowCart(true)}
  >
    <div className="flex items-center gap-2">
      <ShoppingCart className="w-5 h-5" />
      <span>{t.cart}</span>
      <Badge className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-bold">
        {itemCount}
      </Badge>
    </div>
    <span className="font-heading font-bold text-xl">
      ${total}
    </span>
  </Button>
</div>
```

### 7.8 LoadingSkeleton（骨架屏 -- 光澤效果）

```jsx
<div className="
  animate-shimmer
  bg-gradient-to-r from-warm-100 via-warm-50 to-warm-100
  bg-[length:200%_100%]
  rounded-xl
  h-[80px]
" />
```

---

## 8. 頁面級元件

### 8.1 Landing Page 完整結構

```jsx
<div className="relative flex min-h-dvh flex-col items-center justify-center gap-8 p-6 overflow-hidden no-select">
  {/* 背景：和紙色 + 淡青海波 */}
  <div className="absolute inset-0 seigaiha-subtle pointer-events-none" />

  {/* Logo 區域 */}
  <div className="relative z-10 flex flex-col items-center gap-2 animate-fade-in-up">
    {/* 蒸氣動畫 */}
    <SteamAnimation size="lg" className="text-primary-300 mb-2" />

    {/* 書法 Logo */}
    <h1 className="font-decorative text-5xl tracking-[0.15em] text-warm-950">
      宏麵屋
    </h1>
    <p className="font-heading text-xs tracking-[0.3em] uppercase text-warm-500">
      Hiromen-ya
    </p>
    <div className="mt-2 h-[2px] w-20 bg-gradient-to-r from-transparent via-primary-400 to-transparent" />
  </div>

  {/* 入口按鈕組 */}
  <div className="relative z-10 flex w-full max-w-sm flex-col gap-4 animate-fade-in-up"
    style={{ animationDelay: '0.3s' }}>

    {/* 顧客點餐 - 朱紅主按鈕 */}
    <Button size="xl" className="
      w-full text-xl
      bg-accent-600 text-white
      rounded-xl
      shadow-lg shadow-accent-600/20
      hover:bg-accent-700
      active:scale-[0.98]
      min-h-14
    ">
      <Soup className="!size-6" />
      {t.customerOrder}
    </Button>

    {/* 廚房管理 - 木色邊框按鈕 */}
    <Button size="lg" className="
      w-full
      border-2 border-primary-300 text-primary-700
      bg-transparent
      rounded-xl
      hover:bg-primary-50
      active:scale-[0.98]
    ">
      <ChefHat className="!size-5" />
      {t.kitchenManage}
    </Button>

    {/* 叫號看板 - 木色邊框按鈕 */}
    <Button size="lg" className="
      w-full
      border-2 border-primary-300 text-primary-700
      bg-transparent
      rounded-xl
      hover:bg-primary-50
      active:scale-[0.98]
    ">
      <Monitor className="!size-5" />
      {t.queueDisplay}
    </Button>
  </div>

  {/* 語言切換 */}
  <Button variant="ghost" size="sm" className="
    relative z-10 mt-4
    text-warm-500 hover:text-warm-700
    animate-fade-in
  " style={{ animationDelay: '0.6s' }}>
    <Globe className="!size-4" />
    {language === 'zh' ? 'English' : '中文'}
  </Button>

  {/* 底部雲紋裝飾 */}
  <CloudDivider variant="simple" className="absolute bottom-0 left-0 right-0" />
</div>
```

### 8.2 Queue View 完整結構（深色主題）

```jsx
<div className="flex min-h-dvh flex-col bg-[#1a1714] text-warm-100 no-select">
  {/* Header */}
  <header className="flex items-center justify-between px-4 py-3 border-b border-[#3d372e]">
    <Button variant="ghost" size="icon" className="text-warm-400 hover:bg-white/5">
      <ArrowLeft />
    </Button>
    <h1 className="font-decorative text-xl tracking-[0.1em] text-primary-400">
      宏麵屋
    </h1>
    <Button variant="ghost" size="icon" className="text-warm-400 hover:bg-white/5">
      {isFullscreen ? <Minimize /> : <Maximize />}
    </Button>
  </header>

  {/* 雲紋分隔 */}
  <CloudDivider variant="simple" className="opacity-30" />

  {/* 主內容 */}
  <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
    {/* 當前叫號 */}
    <div className="text-center">
      <p className="text-lg text-warm-500 font-heading">{t.nowServing}</p>
      {currentOrder ? (
        <JapaneseFrame>
          <button
            onClick={() => handleCallAgain(currentOrder.orderNumber)}
            className="
              font-mono font-bold text-emerald-400
              text-[clamp(5rem,15vw,10rem)]
              leading-none
              animate-pulse-soft
              hover:scale-105 active:scale-95
              transition-transform
            "
          >
            {currentOrder.orderNumber}
          </button>
        </JapaneseFrame>
      ) : (
        <p className="mt-4 text-3xl text-warm-700 font-heading">{t.noCurrentOrder}</p>
      )}
    </div>

    {/* 青海波分隔 */}
    <WaveDivider variant="dark" animated className="w-full max-w-lg" />

    {/* 準備中 */}
    {preparingOrders.length > 0 && (
      <div className="w-full max-w-2xl">
        <p className="mb-3 text-center text-sm text-warm-500 font-heading">
          {t.preparingOrders}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {preparingOrders.map(o => (
            <div key={o.id} className="
              rounded-xl bg-amber-500/15 border border-amber-500/25
              px-6 py-3
              text-2xl font-bold font-mono text-amber-400
            ">
              #{o.orderNumber}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* 最近完成 */}
    {recentCompleted.length > 0 && (
      <div className="w-full max-w-2xl">
        <p className="mb-3 text-center text-sm text-warm-500 font-heading">
          {t.recentCompleted}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {recentCompleted.map(o => (
            <button key={o.id}
              onClick={() => handleCallAgain(o.orderNumber)}
              className="
                rounded-xl bg-emerald-500/15 border border-emerald-500/25
                px-5 py-2
                text-xl font-bold font-mono text-emerald-400
                hover:bg-emerald-500/25 active:scale-95
                transition-all duration-200
              "
            >
              #{o.orderNumber}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* 底部青海波裝飾 */}
  <div className="seigaiha-dark seigaiha-animated h-7 opacity-20" />
</div>
```

---

## 附錄：預設拉麵菜單建議

既然客戶是拉麵店，建議將預設菜單更新為拉麵相關品項：

### 分類

| ID | 中文 | 英文 | 排序 |
|----|------|------|------|
| cat-1 | 拉麵 | Ramen | 0 |
| cat-2 | 配菜 | Side Dishes | 1 |
| cat-3 | 飲料 | Drinks | 2 |
| cat-4 | 甜點 | Desserts | 3 |

### 品項

| 分類 | 中文 | 英文 | 價格 | 選項 |
|------|------|------|------|------|
| 拉麵 | 豚骨拉麵 | Tonkotsu Ramen | 180 | 加叉燒(+40)、加味玉(+20)、大盛(+30) |
| 拉麵 | 醬油拉麵 | Shoyu Ramen | 160 | 加叉燒(+40)、加味玉(+20)、大盛(+30) |
| 拉麵 | 味噌拉麵 | Miso Ramen | 180 | 加叉燒(+40)、加味玉(+20)、大盛(+30) |
| 拉麵 | 鹽味拉麵 | Shio Ramen | 160 | 加叉燒(+40)、加味玉(+20)、大盛(+30) |
| 拉麵 | 辣味拉麵 | Spicy Ramen | 190 | 加叉燒(+40)、加味玉(+20)、大盛(+30) |
| 配菜 | 煎餃 | Gyoza (6pcs) | 80 | - |
| 配菜 | 唐揚雞 | Karaage | 90 | - |
| 配菜 | 毛豆 | Edamame | 50 | - |
| 配菜 | 日式炸豆腐 | Agedashi Tofu | 70 | - |
| 飲料 | 可爾必思 | Calpis | 40 | - |
| 飲料 | 烏龍茶 | Oolong Tea | 30 | - |
| 飲料 | 檸檬沙瓦 | Lemon Sour | 60 | - |
| 甜點 | 抹茶冰淇淋 | Matcha Ice Cream | 60 | - |
