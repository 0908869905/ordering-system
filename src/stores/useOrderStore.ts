import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Order, OrderStatus } from '@/types'
import { generateId } from '@/lib/utils'

interface RevenueAdjustment {
  id: string
  amount: number
  reason: string
  createdAt: number
}

interface OrderState {
  orders: Order[]
  nextOrderNumber: number
  revenueAdjustments: RevenueAdjustment[]

  createOrder: (items: CartItem[], totalAmount: number) => Order
  updateOrderStatus: (id: string, status: OrderStatus) => void
  getOrdersByStatus: (status: OrderStatus) => Order[]
  getActiveOrders: () => Order[]
  getCompletedOrders: () => Order[]
  addRevenueAdjustment: (amount: number, reason: string) => void
  removeRevenueAdjustment: (id: string) => void
  resetOrders: () => void
  resetCounter: () => void
  replaceAll: (orders: Order[], nextOrderNumber: number) => void
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      nextOrderNumber: 1,
      revenueAdjustments: [],

      createOrder: (items, totalAmount) => {
        const { nextOrderNumber } = get()
        const newOrder: Order = {
          id: generateId('order'),
          orderNumber: nextOrderNumber,
          items,
          totalAmount,
          status: 'created',
          createdAt: Date.now(),
        }
        set({
          orders: [newOrder, ...get().orders],
          nextOrderNumber: nextOrderNumber + 1,
        })
        return newOrder
      },

      updateOrderStatus: (id, status) => {
        const now = Date.now()
        const timestampKey: Partial<Record<OrderStatus, keyof Order>> = {
          paid: 'paidAt',
          completed: 'completedAt',
          picked_up: 'pickedUpAt',
          cancelled: 'cancelledAt',
        }
        set({
          orders: get().orders.map((o) => {
            if (o.id !== id) return o
            const key = timestampKey[status]
            return { ...o, status, ...(key ? { [key]: now } : {}) }
          }),
        })
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter((o) => o.status === status)
      },

      getActiveOrders: () => {
        return get().orders.filter(
          (o) => !['picked_up', 'cancelled'].includes(o.status)
        )
      },

      getCompletedOrders: () => {
        return get().orders.filter(
          (o) => o.status === 'picked_up' || o.status === 'completed'
        )
      },

      addRevenueAdjustment: (amount, reason) => {
        const adj: RevenueAdjustment = {
          id: generateId('adj'),
          amount,
          reason,
          createdAt: Date.now(),
        }
        set({ revenueAdjustments: [...get().revenueAdjustments, adj] })
      },

      removeRevenueAdjustment: (id) => {
        set({
          revenueAdjustments: get().revenueAdjustments.filter((a) => a.id !== id),
        })
      },

      resetOrders: () => {
        set({ orders: [], revenueAdjustments: [] })
      },

      resetCounter: () => {
        set({ nextOrderNumber: 1 })
      },

      replaceAll: (orders, nextOrderNumber) => {
        set({ orders, nextOrderNumber })
      },
    }),
    {
      name: 'ordering-orders',
    }
  )
)
