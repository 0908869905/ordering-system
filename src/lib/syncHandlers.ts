import { useOrderStore } from '@/stores/useOrderStore'
import { useMenuStore } from '@/stores/useMenuStore'
import type { PeerMessage, Order, Category, MenuItem } from '@/types'

// -- Payload type guards for P2P messages --

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function isValidOrder(data: unknown): data is Order {
  if (!isObject(data)) return false
  return (
    typeof data.id === 'string' &&
    typeof data.orderNumber === 'number' &&
    Array.isArray(data.items) &&
    typeof data.totalAmount === 'number' &&
    typeof data.status === 'string'
  )
}

function isValidOrderUpdate(
  data: unknown
): data is { id: string; status: string } {
  if (!isObject(data)) return false
  return typeof data.id === 'string' && typeof data.status === 'string'
}

function isValidMenuSync(
  data: unknown
): data is { categories: Category[]; items: MenuItem[] } {
  if (!isObject(data)) return false
  return Array.isArray(data.categories) && Array.isArray(data.items)
}

function isValidInventorySync(data: unknown): data is { items: MenuItem[] } {
  if (!isObject(data)) return false
  return Array.isArray(data.items)
}

function isValidFullSync(data: unknown): data is {
  orders: Order[]
  nextOrderNumber: number
  categories: Category[]
  items: MenuItem[]
} {
  if (!isObject(data)) return false
  return (
    Array.isArray(data.orders) &&
    typeof data.nextOrderNumber === 'number' &&
    Array.isArray(data.categories) &&
    Array.isArray(data.items)
  )
}

// -- Shared message application logic --

function applyNewOrder(payload: unknown): void {
  if (!isValidOrder(payload)) return
  const order = payload
  const { orders } = useOrderStore.getState()
  if (orders.some((o) => o.id === order.id)) return
  useOrderStore.setState((state) => ({
    orders: [order, ...state.orders],
    nextOrderNumber: Math.max(state.nextOrderNumber, order.orderNumber + 1),
  }))
}

function applyOrderUpdate(payload: unknown): void {
  if (!isValidOrderUpdate(payload)) return
  const { id, status, ...timestamps } = payload as {
    id: string
    status: string
    paidAt?: number
    completedAt?: number
    pickedUpAt?: number
    cancelledAt?: number
  }
  useOrderStore.setState((state) => ({
    orders: state.orders.map((o) =>
      o.id === id
        ? { ...o, status: status as Order['status'], ...timestamps }
        : o
    ),
  }))
}

function applyMenuSync(payload: unknown): void {
  if (!isValidMenuSync(payload)) return
  const { categories, items } = payload
  useMenuStore.getState().replaceAll(categories, items)
}

function applyInventorySync(payload: unknown): void {
  if (!isValidInventorySync(payload)) return
  useMenuStore.setState({ items: payload.items })
}

function applyFullSync(payload: unknown): void {
  if (!isValidFullSync(payload)) return
  useOrderStore.setState({
    orders: payload.orders,
    nextOrderNumber: payload.nextOrderNumber,
  })
  useMenuStore.setState({
    categories: payload.categories,
    items: payload.items,
  })
}

/**
 * Apply a sync message to the local stores.
 * Returns true if the message was handled, false otherwise.
 */
export function applySyncMessage(message: PeerMessage): boolean {
  switch (message.type) {
    case 'NEW_ORDER':
      applyNewOrder(message.payload)
      return true
    case 'ORDER_UPDATE':
      applyOrderUpdate(message.payload)
      return true
    case 'MENU_SYNC':
      applyMenuSync(message.payload)
      return true
    case 'INVENTORY_SYNC':
      applyInventorySync(message.payload)
      return true
    case 'FULL_SYNC':
      applyFullSync(message.payload)
      return true
    default:
      return false
  }
}
