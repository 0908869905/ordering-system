import Peer, { DataConnection } from 'peerjs'
import type { PeerMessage, PeerMessageType } from '@/types'

export type ConnectionState = 'disconnected' | 'connecting' | 'connected'

export type MessageHandler = (message: PeerMessage, conn: DataConnection) => void

const RECONNECT_BASE_DELAY = 1000
const RECONNECT_MAX_DELAY = 30000
const PING_INTERVAL = 15000

export class PeerService {
  private peer: Peer | null = null
  private connections: Map<string, DataConnection> = new Map()
  private messageHandlers: Set<MessageHandler> = new Set()
  private stateChangeHandlers: Set<(state: ConnectionState) => void> = new Set()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private reconnectAttempts = 0
  private _peerId = ''
  private _isHost = false
  private _state: ConnectionState = 'disconnected'
  private hostPeerId = ''
  private destroyed = false

  get peerId() {
    return this._peerId
  }

  get isHost() {
    return this._isHost
  }

  get state() {
    return this._state
  }

  get connectedPeers() {
    return Array.from(this.connections.keys())
  }

  private setState(state: ConnectionState) {
    this._state = state
    this.stateChangeHandlers.forEach((h) => h(state))
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  onStateChange(handler: (state: ConnectionState) => void) {
    this.stateChangeHandlers.add(handler)
    return () => {
      this.stateChangeHandlers.delete(handler)
    }
  }

  /** Start as Host (Kitchen). Creates a peer with a fixed ID prefix. */
  startAsHost(stallId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.destroy()
      this.destroyed = false
      this._isHost = true

      const peerId = `order-host-${stallId}-${Date.now().toString(36)}`
      this.setState('connecting')

      this.peer = new Peer(peerId)

      this.peer.on('open', (id) => {
        this._peerId = id
        this.setState('connected')
        this.startPing()
        resolve(id)
      })

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn)
      })

      this.peer.on('error', (err) => {
        console.error('[PeerService] Host error:', err)
        if (this._state === 'connecting') {
          reject(err)
        }
      })

      this.peer.on('disconnected', () => {
        if (!this.destroyed) {
          this.setState('connecting')
          this.attemptReconnect()
        }
      })
    })
  }

  /** Start as Client. Connects to a host peer ID. */
  connectToHost(hostId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.destroy()
      this.destroyed = false
      this._isHost = false
      this.hostPeerId = hostId
      this.setState('connecting')

      this.peer = new Peer()

      this.peer.on('open', (id) => {
        this._peerId = id
        const conn = this.peer!.connect(hostId, { reliable: true })
        this.setupConnection(conn)

        conn.on('open', () => {
          this.setState('connected')
          this.startPing()
          resolve()
        })

        conn.on('error', (err) => {
          console.error('[PeerService] Connection error:', err)
          if (this._state === 'connecting') {
            reject(err)
          }
        })
      })

      this.peer.on('error', (err) => {
        console.error('[PeerService] Client error:', err)
        if (this._state === 'connecting') {
          reject(err)
        }
        // Attempt reconnect on fatal errors
        if (!this.destroyed) {
          this.setState('disconnected')
          this.attemptReconnect()
        }
      })

      this.peer.on('disconnected', () => {
        if (!this.destroyed) {
          this.setState('connecting')
          this.attemptReconnect()
        }
      })
    })
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn)
      if (this.connections.size > 0) {
        this.setState('connected')
      }
    })

    conn.on('data', (data) => {
      const message = data as PeerMessage
      this.messageHandlers.forEach((h) => h(message, conn))

      // Auto-reply to PING
      if (message.type === 'PING') {
        this.sendTo(conn.peer, 'PONG', null)
      }
    })

    conn.on('close', () => {
      this.connections.delete(conn.peer)
      if (this.connections.size === 0 && !this._isHost) {
        this.setState('disconnected')
        if (!this.destroyed) {
          this.attemptReconnect()
        }
      }
    })

    conn.on('error', (err) => {
      console.error('[PeerService] Connection error:', err)
      this.connections.delete(conn.peer)
    })
  }

  private attemptReconnect() {
    if (this.reconnectTimer || this.destroyed) return

    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_DELAY
    )
    this.reconnectAttempts++

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (this.destroyed) return

      if (this._isHost && this.peer) {
        try {
          this.peer.reconnect()
        } catch {
          // Peer might be fully destroyed, try fresh
        }
      } else if (this.hostPeerId) {
        this.connectToHost(this.hostPeerId).catch(() => {
          // Will retry via disconnect handler
        })
      }
    }, delay)
  }

  private startPing() {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      this.broadcast('PING', null)
    }, PING_INTERVAL)
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  /** Send a message to a specific peer */
  sendTo(peerId: string, type: PeerMessageType, payload: unknown) {
    const conn = this.connections.get(peerId)
    if (conn?.open) {
      const message: PeerMessage = {
        type,
        payload,
        timestamp: Date.now(),
        senderId: this._peerId,
      }
      conn.send(message)
    }
  }

  /** Broadcast a message to all connected peers */
  broadcast(type: PeerMessageType, payload: unknown) {
    const message: PeerMessage = {
      type,
      payload,
      timestamp: Date.now(),
      senderId: this._peerId,
    }
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message)
      }
    })
  }

  destroy() {
    this.destroyed = true
    this.stopPing()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.connections.forEach((conn) => conn.close())
    this.connections.clear()
    this.peer?.destroy()
    this.peer = null
    this._peerId = ''
    this.reconnectAttempts = 0
    this.setState('disconnected')
  }
}

// Singleton instance
export const peerService = new PeerService()

// BroadcastChannel for same-device tab sync
const CHANNEL_NAME = 'ordering-system-sync'
let broadcastChannel: BroadcastChannel | null = null

export function getBroadcastChannel(): BroadcastChannel {
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  }
  return broadcastChannel
}

export function broadcastLocal(type: PeerMessageType, payload: unknown) {
  try {
    getBroadcastChannel().postMessage({ type, payload, timestamp: Date.now() })
  } catch {
    // BroadcastChannel might not be available
  }
}
