import { useEffect } from 'react'
import { getBroadcastChannel } from '@/lib/peer'
import { useMenuStore } from '@/stores/useMenuStore'
import { useOrderStore } from '@/stores/useOrderStore'
import type { PeerMessage, Order, Category, MenuItem } from '@/types'

/**
 * Lightweight BroadcastChannel listener for non-kitchen pages.
 * Receives menu/inventory/order updates from the kitchen tab on the same device.
 */
export function useBroadcastListener() {
  useEffect(() => {
    const channel = getBroadcastChannel()
    const handler = (event: MessageEvent) => {
      const msg = event.data as PeerMessage
      switch (msg.type) {
        case 'MENU_SYNC': {
          const { categories, items } = msg.payload as {
            categories: Category[]
            items: MenuItem[]
          }
          useMenuStore.getState().replaceAll(categories, items)
          break
        }
        case 'INVENTORY_SYNC': {
          const { items } = msg.payload as { items: MenuItem[] }
          useMenuStore.setState({ items })
          break
        }
        case 'NEW_ORDER': {
          const order = msg.payload as Order
          const store = useOrderStore.getState()
          if (!store.orders.find((o) => o.id === order.id)) {
            useOrderStore.setState((state) => ({
              orders: [order, ...state.orders],
              nextOrderNumber: Math.max(state.nextOrderNumber, order.orderNumber + 1),
            }))
          }
          break
        }
        case 'ORDER_UPDATE': {
          const { id, status, ...timestamps } = msg.payload as {
            id: string
            status: string
            paidAt?: number
            completedAt?: number
            pickedUpAt?: number
            cancelledAt?: number
          }
          useOrderStore.setState((state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? { ...o, status: status as Order['status'], ...timestamps } : o
            ),
          }))
          break
        }
      }
    }
    channel.addEventListener('message', handler)
    return () => channel.removeEventListener('message', handler)
  }, [])
}
