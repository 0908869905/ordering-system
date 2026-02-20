import { useState, useEffect, useMemo, useCallback } from 'react'
import { ArrowLeft, Maximize, Minimize, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useOrderStore } from '@/stores/useOrderStore'
import { useSound } from '@/hooks/useSound'
import { useSpeech } from '@/hooks/useSpeech'
import JapaneseFrame from '@/components/shared/JapaneseFrame'
import CloudDivider from '@/components/shared/CloudDivider'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
}

export default function QueueView({ t }: Props) {
  const { setCurrentView } = useSettingsStore()
  const orders = useOrderStore((s) => s.orders)
  const { playNotification } = useSound()
  const { callNumber } = useSpeech()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  // Track completed orders for auto-calling
  const [calledOrders, setCalledOrders] = useState<Set<string>>(new Set())

  const completedOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'completed')
        .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
    [orders]
  )

  const preparingOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'paid' || o.status === 'preparing')
        .sort((a, b) => a.createdAt - b.createdAt),
    [orders]
  )

  const currentOrder = completedOrders[0]
  const recentCompleted = completedOrders.slice(1, 6)

  // Auto-call new completed orders
  useEffect(() => {
    if (!audioUnlocked) return
    for (const order of completedOrders) {
      if (!calledOrders.has(order.id)) {
        playNotification()
        setTimeout(() => callNumber(order.orderNumber), 600)
        setCalledOrders((prev) => new Set(prev).add(order.id))
        break // Only call one at a time
      }
    }
  }, [completedOrders, calledOrders, audioUnlocked, playNotification, callNumber])

  const handleCallAgain = useCallback(
    (orderNumber: number) => {
      playNotification()
      setTimeout(() => callNumber(orderNumber), 600)
    },
    [playNotification, callNumber]
  )

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const unlockAudio = () => {
    setAudioUnlocked(true)
    playNotification()
  }

  if (!audioUnlocked) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 bg-[#1a1714] text-[#f5f1eb] no-select">
        <Button
          variant="ghost"
          className="absolute left-4 top-4 text-warm-400 hover:bg-warm-800/30"
          onClick={() => setCurrentView('landing')}
        >
          <ArrowLeft className="!size-5" />
          {t.back}
        </Button>
        <Volume2 className="h-20 w-20 text-primary-400" />
        <h1 className="font-decorative text-3xl tracking-[0.15em]">宏麵屋</h1>
        <p className="text-center text-warm-500">
          {t.soundEnabled}
        </p>
        <Button size="xl" className="bg-accent-600 hover:bg-accent-700 text-white" onClick={unlockAudio}>
          <Volume2 className="!size-6" />
          {t.confirm}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#1a1714] text-[#f5f1eb] no-select">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-warm-800/20">
        <Button
          variant="ghost"
          size="icon"
          className="text-warm-400 hover:bg-warm-800/30"
          onClick={() => setCurrentView('landing')}
        >
          <ArrowLeft />
        </Button>
        <h1 className="font-decorative text-xl tracking-[0.15em] text-primary-400">
          宏麵屋
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-warm-400 hover:bg-warm-800/30"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>
      </header>

      {/* 雲紋裝飾帶 */}
      <div className="dark">
        <CloudDivider />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        {/* Current Number */}
        <div className="text-center">
          <p className="font-heading text-lg text-primary-400/70">{t.nowServing}</p>
          {currentOrder ? (
            <JapaneseFrame className="mt-4">
              <button
                onClick={() => handleCallAgain(currentOrder.orderNumber)}
                className="font-mono text-[120px] font-black leading-none text-emerald-400 animate-pulse-soft transition-transform hover:scale-105 active:scale-95 sm:text-[180px]"
              >
                {currentOrder.orderNumber}
              </button>
            </JapaneseFrame>
          ) : (
            <p className="mt-4 font-heading text-4xl text-warm-700">{t.noCurrentOrder}</p>
          )}
        </div>

        {/* Preparing */}
        {preparingOrders.length > 0 && (
          <div className="w-full max-w-2xl">
            <p className="mb-2 text-center font-heading text-sm text-warm-500">
              {t.preparingOrders}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {preparingOrders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-xl bg-amber-500/15 px-6 py-3 font-mono text-2xl font-bold text-amber-400"
                >
                  #{o.orderNumber}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Completed */}
        {recentCompleted.length > 0 && (
          <div className="w-full max-w-2xl">
            <p className="mb-2 text-center font-heading text-sm text-warm-500">
              {t.recentCompleted}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {recentCompleted.map((o) => (
                <button
                  key={o.id}
                  onClick={() => handleCallAgain(o.orderNumber)}
                  className="rounded-xl bg-emerald-500/15 px-5 py-2 font-mono text-xl font-bold text-emerald-400 transition-transform hover:scale-105 active:scale-95"
                >
                  #{o.orderNumber}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部青海波裝飾 */}
      <div className="seigaiha seigaiha-dark seigaiha-animated h-[28px] w-full" />
    </div>
  )
}
