import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '@/types'
import { DEFAULT_PASSWORD_HASH } from '@/constants'

interface SettingsState {
  language: Language
  stallName: string
  passwordHash: string
  isKitchenAuthenticated: boolean
  soundEnabled: boolean
  speechEnabled: boolean
  volume: number
  peerId: string
  hostPeerId: string

  setLanguage: (lang: Language) => void
  setStallName: (name: string) => void
  setPasswordHash: (hash: string) => void
  setKitchenAuthenticated: (auth: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setSpeechEnabled: (enabled: boolean) => void
  setVolume: (vol: number) => void
  setPeerId: (id: string) => void
  setHostPeerId: (id: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'zh',
      stallName: '宏麵屋',
      passwordHash: DEFAULT_PASSWORD_HASH,
      isKitchenAuthenticated: false,
      soundEnabled: true,
      speechEnabled: true,
      volume: 80,
      peerId: '',
      hostPeerId: '',

      setLanguage: (language) => set({ language }),
      setStallName: (stallName) => set({ stallName }),
      setPasswordHash: (passwordHash) => set({ passwordHash }),
      setKitchenAuthenticated: (isKitchenAuthenticated) => set({ isKitchenAuthenticated }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setSpeechEnabled: (speechEnabled) => set({ speechEnabled }),
      setVolume: (volume) => set({ volume }),
      setPeerId: (peerId) => set({ peerId }),
      setHostPeerId: (hostPeerId) => set({ hostPeerId }),
    }),
    {
      name: 'ordering-settings',
      partialize: (state) => ({
        language: state.language,
        stallName: state.stallName,
        passwordHash: state.passwordHash,
        soundEnabled: state.soundEnabled,
        speechEnabled: state.speechEnabled,
        volume: state.volume,
        hostPeerId: state.hostPeerId,
      }),
    }
  )
)
