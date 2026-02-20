import { useState } from 'react'
import { Wifi, WifiOff, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { ConnectionState } from '@/lib/peer'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
  connectionState: ConnectionState
  peerId: string
  connectedPeers: string[]
  isHost: boolean
  onStartHost: (stallId: string) => Promise<string>
  onConnect: (hostId: string) => Promise<void>
  onDisconnect: () => void
}

export default function ConnectionStatus({
  t,
  connectionState,
  peerId,
  connectedPeers,
  isHost,
  onStartHost,
  onConnect,
  onDisconnect,
}: Props) {
  const [showDialog, setShowDialog] = useState(false)
  const [hostIdInput, setHostIdInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const stateMap: Record<ConnectionState, { color: string; text: string }> = {
    connected: { color: 'bg-[hsl(var(--success))]', text: t.connected },
    connecting: { color: 'bg-[hsl(var(--warning))]', text: t.connecting },
    disconnected: { color: 'bg-gray-400', text: t.disconnected },
  }
  const { color: stateColor, text: stateText } = stateMap[connectionState]

  const handleCopyId = async () => {
    if (peerId) {
      await navigator.clipboard.writeText(peerId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStartHost = async () => {
    setError('')
    try {
      await onStartHost(`stall-${Date.now().toString(36)}`)
    } catch {
      setError('Failed to start host')
    }
  }

  const handleConnect = async () => {
    setError('')
    if (!hostIdInput.trim()) return
    try {
      await onConnect(hostIdInput.trim())
      setShowDialog(false)
    } catch {
      setError('Failed to connect')
    }
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-1.5 rounded-full border border-warm-700/30 px-3 py-1.5 text-xs transition-colors hover:bg-warm-800/30"
      >
        <span className={`h-2 w-2 rounded-full ${stateColor}`} />
        {stateText}
        {connectionState === 'connected' && connectedPeers.length > 0 && (
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {connectedPeers.length}
          </Badge>
        )}
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.connect}</DialogTitle>
            <DialogDescription>{t.deviceId}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              {connectionState === 'connected' && (
                <Wifi className="h-5 w-5 text-[hsl(var(--success))]" />
              )}
              {connectionState === 'connecting' && (
                <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--warning))]" />
              )}
              {connectionState === 'disconnected' && (
                <WifiOff className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium">{stateText}</span>
              {isHost && (
                <Badge variant="default" className="text-[10px]">
                  Host
                </Badge>
              )}
            </div>

            {/* Peer ID */}
            {peerId && (
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-hidden rounded bg-[hsl(var(--secondary))] px-2 py-1 font-mono text-xs text-ellipsis">
                  {peerId}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopyId}
                >
                  {copied ? (
                    <Check className="!size-4 text-[hsl(var(--success))]" />
                  ) : (
                    <Copy className="!size-4" />
                  )}
                </Button>
              </div>
            )}

            {error && (
              <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>
            )}

            {connectionState === 'disconnected' && (
              <>
                {/* Start as Host */}
                <Button onClick={handleStartHost} className="w-full">
                  Host ({t.kitchenManage})
                </Button>

                {/* Connect to Host */}
                <div className="flex gap-2">
                  <Input
                    placeholder={t.hostId}
                    value={hostIdInput}
                    onChange={(e) => setHostIdInput(e.target.value)}
                    className="h-10 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConnect()
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={handleConnect}
                    disabled={!hostIdInput.trim()}
                  >
                    {t.connect}
                  </Button>
                </div>
              </>
            )}

            {connectionState !== 'disconnected' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDisconnect()
                  setShowDialog(false)
                }}
              >
                {t.disconnected}
              </Button>
            )}

            {/* Local mode info */}
            <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
              {t.localMode}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
