import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { CardContent } from '@/components/ui/card'
import { Button, type ButtonProps } from '@/components/ui/button'
import { localized } from '@/lib/utils'
import type { Order, Language } from '@/types'
import type { Translations } from '@/constants'

interface ActionConfig {
  label: string
  onClick: () => void
  variant: ButtonProps['variant']
}

interface Props {
  order: Order
  t: Translations
  language: Language
  primaryAction?: ActionConfig
  secondaryAction?: ActionConfig
}

export default function OrderCard({
  order,
  t,
  language,
  primaryAction,
  secondaryAction,
}: Props) {
  const [waitMinutes, setWaitMinutes] = useState(() =>
    Math.floor((Date.now() - order.createdAt) / 60000)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setWaitMinutes(Math.floor((Date.now() - order.createdAt) / 60000))
    }, 30000)
    return () => clearInterval(interval)
  }, [order.createdAt])

  let waitColor = 'text-warm-500'
  let urgencyBg = ''
  let waitClass = ''
  if (waitMinutes > 10) {
    waitColor = 'text-accent-500'
    urgencyBg = 'bg-red-500/5'
    waitClass = 'wait-urgent'
  } else if (waitMinutes > 5) {
    waitColor = 'text-amber-400'
    urgencyBg = 'bg-amber-500/5'
  }

  return (
    <div className={`receipt-edge pin-decoration overflow-hidden bg-[#2e2a22] border-l-[3px] border-l-current organic-radius ${urgencyBg}`}>
      <CardContent className="p-3 pt-4">
        {/* Header Row */}
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-2xl font-black ink-text">#{order.orderNumber}</span>
          <div className={`flex items-center gap-1 text-xs font-mono ${waitColor} ${waitClass}`}>
            <Clock className="h-3 w-3" />
            {waitMinutes}{t.minutes}
          </div>
        </div>

        {/* 虛線分隔（像收據） */}
        <div className="mb-2 border-t border-dashed border-warm-600/30" />

        {/* Items */}
        <div className="mb-2 space-y-1 text-sm">
          {order.items.map((item, idx) => {
            const name = localized(language, item.name, item.nameEn)
            return (
              <div key={idx} className="flex justify-between">
                <span className="font-heading">
                  {name} x{item.quantity}
                  {item.selectedOptions.length > 0 && (
                    <span className="ml-1 text-xs text-[hsl(var(--muted-foreground))]">
                      (
                      {item.selectedOptions
                        .map((o) => localized(language, o.name, o.nameEn))
                        .join(', ')}
                      )
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-mono">${item.subtotal}</span>
              </div>
            )
          })}
          {order.items.some((i) => i.notes) && (
            <div className="mt-1 organic-radius bg-amber-500/10 border border-amber-500/20 px-2 py-1">
              {order.items
                .filter((i) => i.notes)
                .map((item, idx) => (
                  <p
                    key={idx}
                    className="text-xs italic text-amber-300 font-heading"
                  >
                    📝 {item.notes}
                  </p>
                ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="mb-3 flex items-center justify-between border-t border-dashed border-warm-600/30 pt-2 font-bold">
          <span className="font-heading">{t.total}</span>
          <span className="font-mono">${order.totalAmount}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {primaryAction && (
            <Button
              variant={primaryAction.variant}
              size="sm"
              className="flex-1"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant}
              size="sm"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </div>
  )
}
