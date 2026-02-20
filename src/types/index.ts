// === 菜單相關 ===

export interface Category {
  id: string
  name: string
  nameEn?: string
  order: number
}

export interface MenuOption {
  id: string
  name: string
  nameEn?: string
  price: number
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  nameEn?: string
  price: number
  description?: string
  descriptionEn?: string
  options: MenuOption[]
  available: boolean
  stock: number // -1 表示不限庫存
  order: number
}

// === 購物車 ===

export interface CartItem {
  id: string // 唯一 ID，用於區分相同品項不同選項
  menuItemId: string
  name: string
  nameEn?: string
  price: number
  quantity: number
  selectedOptions: MenuOption[]
  notes: string
  subtotal: number
}

// === 訂單 ===

export type OrderStatus =
  | 'created'
  | 'paid'
  | 'preparing'
  | 'completed'
  | 'picked_up'
  | 'cancelled'

export interface Order {
  id: string
  orderNumber: number
  items: CartItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: number
  paidAt?: number
  completedAt?: number
  pickedUpAt?: number
  cancelledAt?: number
}

// === P2P 同步 ===

export type PeerMessageType =
  | 'NEW_ORDER'
  | 'ORDER_UPDATE'
  | 'INVENTORY_SYNC'
  | 'MENU_SYNC'
  | 'FULL_SYNC'
  | 'PING'
  | 'PONG'

export interface PeerMessage {
  type: PeerMessageType
  payload: unknown
  timestamp: number
  senderId: string
}

// === 設定 ===

export type Language = 'zh' | 'en'

// === 營收報表 ===

export interface RevenueStats {
  totalRevenue: number
  orderCount: number
  averageOrderValue: number
  itemSales: Record<string, { name: string; quantity: number; revenue: number }>
  hourlyOrders: Record<number, number>
}
