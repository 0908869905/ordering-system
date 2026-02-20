import { useEffect, useCallback, useRef, useState } from 'react'
import { peerService, broadcastLocal, getBroadcastChannel, type ConnectionState } from '@/lib/peer'
import { useOrderStore } from '@/stores/useOrderStore'
import { useMenuStore } from '@/stores/useMenuStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import type { PeerMessage, Order, Category, MenuItem } from '@/types'

export function usePeerSync() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [connectedPeers, setConnectedPeers] = useState<string[]>([])
  const isHost = useRef(false)

  // Store references for callbacks
  const orderStoreRef = useRef(useOrderStore.getState)
  const menuStoreRef = useRef(useMenuStore.getState)

  useEffect(() => {
    orderStoreRef.current = useOrderStore.getState
    menuStoreRef.current = useMenuStore.getState
  })

  // Handle incoming P2P messages
  const handleMessage = useCallback((message: PeerMessage) => {
    switch (message.type) {
      case 'NEW_ORDER': {
        const order = message.payload as Order
        const store = orderStoreRef.current()
        // Only add if we don't already have it
        if (!store.orders.find((o) => o.id === order.id)) {
          // Use createOrder-like logic but with the existing order data
          useOrderStore.setState((state) => ({
            orders: [order, ...state.orders],
            nextOrderNumber: Math.max(state.nextOrderNumber, order.orderNumber + 1),
          }))
        }
        broadcastLocal('NEW_ORDER', order)
        break
      }

      case 'ORDER_UPDATE': {
        const { id, status, ...timestamps } = message.payload as {
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
        broadcastLocal('ORDER_UPDATE', message.payload)
        break
      }

      case 'MENU_SYNC': {
        const { categories, items } = message.payload as {
          categories: Category[]
          items: MenuItem[]
        }
        menuStoreRef.current().replaceAll(categories, items)
        broadcastLocal('MENU_SYNC', message.payload)
        break
      }

      case 'INVENTORY_SYNC': {
        const { items } = message.payload as { items: MenuItem[] }
        useMenuStore.setState({ items })
        broadcastLocal('INVENTORY_SYNC', message.payload)
        break
      }

      case 'FULL_SYNC': {
        const data = message.payload as {
          orders: Order[]
          nextOrderNumber: number
          categories: Category[]
          items: MenuItem[]
        }
        useOrderStore.setState({
          orders: data.orders,
          nextOrderNumber: data.nextOrderNumber,
        })
        useMenuStore.setState({
          categories: data.categories,
          items: data.items,
        })
        break
      }

      case 'PING':
      case 'PONG':
        // Handled by PeerService
        break
    }
  }, [])

  // Setup BroadcastChannel for same-device sync
  useEffect(() => {
    const channel = getBroadcastChannel()
    const handler = (event: MessageEvent) => {
      // Only process if we're not the sender
      const msg = event.data as PeerMessage
      if (msg.senderId === peerService.peerId) return
      handleMessage(msg)
    }
    channel.addEventListener('message', handler)
    return () => channel.removeEventListener('message', handler)
  }, [handleMessage])

  // Start as host (Kitchen)
  const startHost = useCallback(async (stallId: string) => {
    try {
      isHost.current = true
      const peerId = await peerService.startAsHost(stallId)
      useSettingsStore.getState().setPeerId(peerId)

      // Listen for messages
      peerService.onMessage((msg, conn) => {
        handleMessage(msg)

        // When a new client connects, send full sync
        if (msg.type === 'PING') {
          const orders = useOrderStore.getState()
          const menu = useMenuStore.getState()
          peerService.sendTo(conn.peer, 'FULL_SYNC', {
            orders: orders.orders,
            nextOrderNumber: orders.nextOrderNumber,
            categories: menu.categories,
            items: menu.items,
          })
        }
      })

      peerService.onStateChange((state) => {
        setConnectionState(state)
        setConnectedPeers(peerService.connectedPeers)
      })

      return peerId
    } catch (err) {
      console.error('[usePeerSync] Failed to start host:', err)
      throw err
    }
  }, [handleMessage])

  // Connect as client
  const connectToHost = useCallback(async (hostId: string) => {
    try {
      isHost.current = false
      await peerService.connectToHost(hostId)
      useSettingsStore.getState().setPeerId(peerService.peerId)
      useSettingsStore.getState().setHostPeerId(hostId)

      peerService.onMessage((msg) => {
        handleMessage(msg)
      })

      peerService.onStateChange((state) => {
        setConnectionState(state)
      })
    } catch (err) {
      console.error('[usePeerSync] Failed to connect:', err)
      throw err
    }
  }, [handleMessage])

  // Broadcast functions for host
  const broadcastNewOrder = useCallback((order: Order) => {
    peerService.broadcast('NEW_ORDER', order)
    broadcastLocal('NEW_ORDER', order)
  }, [])

  const broadcastOrderUpdate = useCallback(
    (orderId: string, status: string, timestamps: Record<string, number | undefined>) => {
      const payload = { id: orderId, status, ...timestamps }
      peerService.broadcast('ORDER_UPDATE', payload)
      broadcastLocal('ORDER_UPDATE', payload)
    },
    []
  )

  const broadcastMenuSync = useCallback(() => {
    const { categories, items } = useMenuStore.getState()
    peerService.broadcast('MENU_SYNC', { categories, items })
    broadcastLocal('MENU_SYNC', { categories, items })
  }, [])

  const broadcastInventorySync = useCallback(() => {
    const { items } = useMenuStore.getState()
    peerService.broadcast('INVENTORY_SYNC', { items })
    broadcastLocal('INVENTORY_SYNC', { items })
  }, [])

  // Disconnect
  const disconnect = useCallback(() => {
    peerService.destroy()
    setConnectionState('disconnected')
    setConnectedPeers([])
  }, [])

  return {
    connectionState,
    connectedPeers,
    peerId: peerService.peerId,
    isHost: isHost.current,
    startHost,
    connectToHost,
    disconnect,
    broadcastNewOrder,
    broadcastOrderUpdate,
    broadcastMenuSync,
    broadcastInventorySync,
  }
}
