
export enum Category {
  FOOD = '主食',
  DRINK = '飲料',
}

export enum OrderStatus {
  UNPAID = 'unpaid',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PICKED_UP = 'picked_up',
}

export interface MenuOption {
  id: string;
  name: string;
  name_en?: string;
  price: number;
  note?: string; // e.g. "本來就有附一個"
  note_en?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  name_en?: string;
  price: number;
  category: Category;
  description: string;
  description_en?: string;
  options?: MenuOption[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedOptions?: MenuOption[];
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: number; // Automatic sequential number
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
  paidTimestamp?: number; // Tracks when order was marked as paid
  aiNote?: string;
}

export type ViewMode = 'landing' | 'customer' | 'kitchen' | 'queue';

// P2P Communication Types
export type PeerMessageType = 'NEW_ORDER' | 'SYNC_STATUS' | 'SYNC_ORDERS' | 'SUBMIT_ORDER' | 'ORDER_CREATED' | 'SYNC_INVENTORY' | 'KITCHEN_ACTION' | 'SYNC_REVENUE_ADJUSTMENT';

export interface PeerMessage {
  type: PeerMessageType;
  payload: any;
}

export type Inventory = Record<string, number>;