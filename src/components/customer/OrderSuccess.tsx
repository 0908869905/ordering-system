import { Home, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RamenBowlIcon from '@/components/shared/RamenBowlIcon'
import SteamAnimation from '@/components/shared/SteamAnimation'
import WaveDivider from '@/components/shared/WaveDivider'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
  orderNumber: number
  totalAmount: number
  onContinue: () => void
  onBackToHome: () => void
}

export default function OrderSuccess({
  t,
  orderNumber,
  totalAmount,
  onContinue,
  onBackToHome,
}: Props) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center no-select">
      {/* 拉麵碗 + 蒸氣 */}
      <div className="relative animate-fade-in">
        <SteamAnimation size="md" className="absolute -top-12 left-1/2 -translate-x-1/2" />
        <RamenBowlIcon size={80} className="text-primary-500" />
      </div>

      <h1 className="font-heading text-2xl font-bold text-warm-950 animate-fade-in">
        {t.orderSuccess}
      </h1>

      {/* 號碼 */}
      <div className="relative order-success-glow">
        <div className="rounded-2xl bg-accent-600 px-12 py-8 text-white animate-bounce-in">
          <p className="text-sm opacity-80">{t.yourNumber}</p>
          <p className="font-mono text-7xl font-black">{orderNumber}</p>
        </div>
      </div>

      <WaveDivider variant="subtle" className="max-w-xs" />

      <div className="font-heading text-xl font-bold text-accent-600">
        {t.total}: ${totalAmount}
      </div>

      <p className="text-warm-500">{t.pleasePayAt}</p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button size="lg" className="w-full" onClick={onContinue}>
          <ShoppingCart className="!size-5" />
          {t.continueShopping}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={onBackToHome}
        >
          <Home className="!size-5" />
          {t.back}
        </Button>
      </div>
    </div>
  )
}
