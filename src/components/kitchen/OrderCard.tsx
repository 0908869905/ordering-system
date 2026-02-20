import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button, type ButtonProps } from '@/components/ui/button'
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
  const waitMinutes = useMemo(() => {
    return Math.floor((Date.now() - order.createdAt) / 60000)
  }, [order.createdAt])

  const waitColor =
    waitMinutes > 10
      ? 'text-[hsl(var(--destructive))]'
      : waitMinutes > 5
        ? 'text-amber-600'
        : 'text-[hsl(var(--muted-foreground))]'

  return (
    <Card className="overflow-hidden bg-[#2e2a22] border-l-[3px] border-l-current">
      <CardContent className="p-3">
        {/* Header Row */}
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-2xl font-black">#{order.orderNumber}</span>
          <div className={`flex items-center gap-1 text-xs ${waitColor}`}>
            <Clock className="h-3 w-3" />
            {waitMinutes} {t.minutes}
          </div>
        </div>

        {/* Items */}
        <div className="mb-2 space-y-1 text-sm">
          {order.items.map((item, idx) => {
            const name =
              language === 'en' && item.nameEn ? item.nameEn : item.name
            return (
              <div key={idx} className="flex justify-between">
                <span>
                  {name} x{item.quantity}
                  {item.selectedOptions.length > 0 && (
                    <span className="ml-1 text-xs text-[hsl(var(--muted-foreground))]">
                      (
                      {item.selectedOptions
                        .map((o) =>
                          language === 'en' && o.nameEn ? o.nameEn : o.name
                        )
                        .join(', ')}
                      )
                    </span>
                  )}
                </span>
                <span className="shrink-0">${item.subtotal}</span>
              </div>
            )
          })}
          {order.items.some((i) => i.notes) && (
            <div className="mt-1">
              {order.items
                .filter((i) => i.notes)
                .map((item, idx) => (
                  <p
                    key={idx}
                    className="text-xs italic text-[hsl(var(--muted-foreground))]"
                  >
                    {item.notes}
                  </p>
                ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="mb-3 flex items-center justify-between border-t border-[hsl(var(--border))] pt-2 font-bold">
          <span>{t.total}</span>
          <span>${order.totalAmount}</span>
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
    </Card>
  )
}
