import { useState } from 'react'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/useCartStore'
import type { Language } from '@/types'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
  language: Language
  onClose: () => void
  onSubmit: () => void
}

export default function Cart({ t, language, onClose, onSubmit }: Props) {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const getTotal = useCartStore((s) => s.getTotal)

  const [showConfirm, setShowConfirm] = useState(false)

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-warm-50">
        <div className="flex items-center justify-between border-b border-warm-200 p-4">
          <h2 className="font-heading text-lg font-bold">{t.cart}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center text-warm-500">
          {t.cartEmpty}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-warm-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-warm-200 p-4">
        <h2 className="font-heading text-lg font-bold">{t.cart}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-[hsl(var(--destructive))]"
            onClick={() => {
              if (confirm(t.confirmClearCart)) {
                clearCart()
                onClose()
              }
            }}
          >
            <Trash2 className="!size-4" />
            {t.clearCart}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const name =
              language === 'en' && item.nameEn ? item.nameEn : item.name
            return (
              <div
                key={item.id}
                className="rounded-lg border border-[hsl(var(--border))] p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{name}</h3>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        +{' '}
                        {item.selectedOptions
                          .map((o) =>
                            language === 'en' && o.nameEn ? o.nameEn : o.name
                          )
                          .join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[hsl(var(--destructive))]"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="!size-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus className="!size-3" />
                    </Button>
                    <span className="w-6 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="!size-3" />
                    </Button>
                  </div>
                  <span className="font-bold">${item.subtotal}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[hsl(var(--border))] p-4">
        {!showConfirm ? (
          <>
            <div className="mb-3 flex items-center justify-between text-lg">
              <span className="font-medium">{t.total}</span>
              <span className="font-heading text-xl font-bold text-accent-600">
                ${getTotal()}
              </span>
            </div>
            <Button
              size="lg"
              className="w-full text-base"
              onClick={() => setShowConfirm(true)}
            >
              {t.confirmOrder}
            </Button>
          </>
        ) : (
          <>
            <h3 className="mb-3 text-center text-lg font-bold">
              {t.orderSummary}
            </h3>
            <div className="mb-3 max-h-40 overflow-y-auto rounded-lg bg-[hsl(var(--secondary))] p-3 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span>
                    {language === 'en' && item.nameEn
                      ? item.nameEn
                      : item.name}{' '}
                    x{item.quantity}
                  </span>
                  <span>${item.subtotal}</span>
                </div>
              ))}
              <div className="mt-2 border-t border-[hsl(var(--border))] pt-2 font-bold">
                <div className="flex justify-between">
                  <span>{t.total}</span>
                  <span>${getTotal()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                {t.back}
              </Button>
              <Button size="lg" className="flex-1 text-base" onClick={onSubmit}>
                {t.submitOrder}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
