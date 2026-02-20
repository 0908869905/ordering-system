import { useCallback, useRef } from 'react'
import { useSettingsStore } from '@/stores/useSettingsStore'

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const { soundEnabled, volume } = useSettingsStore()

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  const playNotification = useCallback(() => {
    if (!soundEnabled) return
    try {
      const ctx = getContext()
      const vol = volume / 100

      // "Ding-dong" notification sound
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      const gain2 = ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.value = 880 // A5
      osc2.type = 'sine'
      osc2.frequency.value = 659.25 // E5

      gain1.gain.setValueAtTime(vol * 0.5, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      gain2.gain.setValueAtTime(0.01, ctx.currentTime)
      gain2.gain.setValueAtTime(vol * 0.5, ctx.currentTime + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      osc1.start(ctx.currentTime)
      osc1.stop(ctx.currentTime + 0.3)
      osc2.start(ctx.currentTime + 0.15)
      osc2.stop(ctx.currentTime + 0.5)
    } catch {
      // Audio context not available
    }
  }, [soundEnabled, volume, getContext])

  return { playNotification }
}
