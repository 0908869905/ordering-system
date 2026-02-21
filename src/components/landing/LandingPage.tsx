import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/useSettingsStore'
import SteamAnimation from '@/components/shared/SteamAnimation'
import CloudDivider from '@/components/shared/CloudDivider'
import LanternIcon from '@/components/shared/LanternIcon'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
}

export default function LandingPage({ t }: Props) {
  const { language, setLanguage } = useSettingsStore()

  return (
    <div className="washi-overlay relative flex min-h-dvh flex-col items-center justify-center gap-8 p-6 no-select overflow-hidden">
      {/* 青海波背景 */}
      <div className="seigaiha seigaiha-subtle seigaiha-animated absolute inset-0 pointer-events-none" />

      {/* Logo 區域 */}
      <div className="relative z-10 flex flex-col items-center gap-1 animate-fade-in">
        {/* 蒸氣動畫 */}
        <SteamAnimation size="lg" className="animate-float" />

        {/* 書法字 Logo */}
        <h1 className="font-decorative text-5xl tracking-[0.15em] text-warm-950 ink-text">
          宏麵屋
        </h1>
        {/* 英文副標題 */}
        <p className="font-heading text-xs tracking-[0.3em] uppercase text-warm-500">
          Hiromen-ya
        </p>
        {/* 毛筆分隔線 */}
        <div className="brush-divider mt-3 w-24" />
      </div>

      {/* 按鈕區域 */}
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <Button asChild size="xl" className="w-full text-xl woodblock-shadow-accent">
          <a href="/customer.html">
            <LanternIcon className="!size-8" />
            {t.customerOrder}
          </a>
        </Button>
      </div>

      {/* 營業中標示 */}
      <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center gap-2 text-warm-500">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" />
          <span className="font-heading text-xs tracking-wider">{language === 'zh' ? '營業中' : 'Now Open'}</span>
        </div>
      </div>

      {/* 語言切換 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
        className="relative z-10 mt-4 text-warm-600 font-heading"
      >
        <Globe className="!size-4" />
        {language === 'zh' ? 'English' : '中文'}
      </Button>

      {/* 底部雲紋裝飾 */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <CloudDivider />
      </div>
    </div>
  )
}
