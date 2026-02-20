import { useEffect, useCallback, useRef, useState } from 'react'
import { peerService, broadcastLocal, getBroadcastChannel, type ConnectionState } from '@/lib/peer'
import { applySyncMessage } from '@/lib/syncHandlers'
import { useOrderStore } from '@/stores/useOrderStore'
import { useMenuStore } from '@/stores/useMenuStore'
import { useSettingsStore } from '@/stores/useSettingsStore'
import type { PeerMessage, Order } from '@/types'

export function usePeerSync() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [connectedPeers, setConnectedPeers] = useState<string[]>([])
  const isHost = useRef(false)

  // Handle incoming P2P messages: apply to stores, then relay to local tabs
  const handleMessage = useCallback((message: PeerMessage) => {
    const handled = applySyncMessage(message)
    if (handled) {
      broadcastLocal(message.type, message.payload)
    }
  }, [])

  // Listen on BroadcastChannel for same-device sync
  useEffect(() => {
    const channel = getBroadcastChannel()
    const handler = (event: MessageEvent) => {
      const msg = event.data as PeerMessage
      if (msg.senderId === peerService.peerId) return
      applySyncMessage(msg)
    }
    channel.addEventListener('message', handler)
    return () => channel.removeEventListener('message', handler)
  }, [])

  // Start as host (Kitchen)
  const startHost = useCallback(async (stallId: string) => {
    isHost.current = true
    const peerId = await peerService.startAsHost(stallId)
    useSettingsStore.getState().setPeerId(peerId)

    peerService.onMessage((msg, conn) => {
      handleMessage(msg)

      // Send full sync to newly connected clients
      if (msg.type === 'PING') {
        const orderState = useOrderStore.getState()
        const menuState = useMenuStore.getState()
        peerService.sendTo(conn.peer, 'FULL_SYNC', {
          orders: orderState.orders,
          nextOrderNumber: orderState.nextOrderNumber,
          categories: menuState.categories,
          items: menuState.items,
        })
      }
    })

    peerService.onStateChange((state) => {
      setConnectionState(state)
      setConnectedPeers(peerService.connectedPeers)
    })

    return peerId
  }, [handleMessage])

  // Connect as client
  const connectToHost = useCallback(async (hostId: string) => {
    isHost.current = false
    await peerService.connectToHost(hostId)
    useSettingsStore.getState().setPeerId(peerService.peerId)
    useSettingsStore.getState().setHostPeerId(hostId)

    peerService.onMessage((msg) => handleMessage(msg))
    peerService.onStateChange((state) => setConnectionState(state))
  }, [handleMessage])

  // Broadcast helpers for host
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
    const payload = { categories, items }
    peerService.broadcast('MENU_SYNC', payload)
    broadcastLocal('MENU_SYNC', payload)
  }, [])

  const broadcastInventorySync = useCallback(() => {
    const { items } = useMenuStore.getState()
    const payload = { items }
    peerService.broadcast('INVENTORY_SYNC', payload)
    broadcastLocal('INVENTORY_SYNC', payload)
  }, [])

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
