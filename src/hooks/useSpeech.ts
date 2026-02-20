import { useCallback } from 'react'
import { useSettingsStore } from '@/stores/useSettingsStore'

export function useSpeech() {
  const { speechEnabled, volume, language } = useSettingsStore()

  const speak = useCallback(
    (text: string) => {
      if (!speechEnabled || !('speechSynthesis' in window)) return

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'zh' ? 'zh-TW' : 'en-US'
      utterance.rate = 0.9
      utterance.volume = volume / 100
      window.speechSynthesis.speak(utterance)
    },
    [speechEnabled, volume, language]
  )

  const callNumber = useCallback(
    (orderNumber: number) => {
      if (language === 'zh') {
        speak(`號碼 ${orderNumber} 號，請取餐`)
      } else {
        speak(`Number ${orderNumber}, your order is ready`)
      }
    },
    [speak, language]
  )

  return { speak, callNumber }
}
