import { useEffect } from 'react'
import { getBroadcastChannel } from '@/lib/peer'
import { applySyncMessage } from '@/lib/syncHandlers'
import type { PeerMessage } from '@/types'

/**
 * Lightweight BroadcastChannel listener for non-kitchen pages.
 * Receives menu/inventory/order updates from the kitchen tab on the same device.
 */
export function useBroadcastListener(): void {
  useEffect(() => {
    const channel = getBroadcastChannel()
    const handler = (event: MessageEvent) => {
      applySyncMessage(event.data as PeerMessage)
    }
    channel.addEventListener('message', handler)
    return () => channel.removeEventListener('message', handler)
  }, [])
}
