import { useState } from 'react'
import { X, Minus, Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/useCartStore'
import { localized } from '@/lib/utils'
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
      <div className="fixed inset-0 z-50 flex flex-col bg-[#fdfcf8] cart-slide-in">
        <div className="flex items-center justify-between border-b border-primary-200/40 p-4">
          <h2 className="font-heading text-lg font-bold ink-text">{t.cart}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <UtensilsCrossed className="h-12 w-12 text-warm-300" />
          <p className="text-warm-500 font-heading">{t.cartEmpty}</p>
          <div className="brush-divider w-16" style={{ opacity: 0.3 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fdfcf8] cart-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-primary-200/40 p-4">
        <h2 className="font-heading text-lg font-bold ink-text">{t.cart}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-accent-600"
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
            const name = localized(language, item.name, item.nameEn)
            return (
              <div
                key={item.id}
                className="organic-radius border border-primary-200/60 bg-white p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-heading font-medium ink-text">{name}</h3>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-xs text-warm-500 mt-0.5">
                        +{' '}
                        {item.selectedOptions
                          .map((o) => localized(language, o.name, o.nameEn))
                          .join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-warm-500 italic mt-0.5">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-accent-500 hover:text-accent-600"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="!size-4" />
                  </Button>
                </div>
                <div className="brush-divider my-2 w-full" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 organic-radius"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus className="!size-3" />
                    </Button>
                    <span className="w-8 text-center font-heading font-bold text-lg">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 organic-radius"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <Plus className="!size-3" />
                    </Button>
                  </div>
                  <span className="font-heading font-bold text-accent-600">${item.subtotal}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-primary-200/40 p-4 bg-[#fdfcf8]">
        {!showConfirm ? (
          <>
            <div className="mb-3 flex items-center justify-between text-lg">
              <span className="font-heading font-medium">{t.total}</span>
              <span className="font-heading text-xl font-bold text-accent-600">
                ${getTotal()}
              </span>
            </div>
            <Button
              size="lg"
              className="w-full text-base woodblock-shadow-accent"
              onClick={() => setShowConfirm(true)}
            >
              {t.confirmOrder}
            </Button>
          </>
        ) : (
          <div className="animate-fade-in-up">
            <h3 className="mb-3 text-center font-heading text-lg font-bold ink-text">
              {t.orderSummary}
            </h3>
            <div className="mb-3 max-h-40 overflow-y-auto organic-radius-alt bg-primary-50/50 p-3 text-sm border border-primary-200/40">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span className="font-heading">
                    {localized(language, item.name, item.nameEn)}{' '}
                    x{item.quantity}
                  </span>
                  <span className="font-heading">${item.subtotal}</span>
                </div>
              ))}
              <div className="brush-divider my-2 w-full" />
              <div className="font-bold">
                <div className="flex justify-between">
                  <span className="font-heading">{t.total}</span>
                  <span className="font-heading text-accent-600">${getTotal()}</span>
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
              <Button size="lg" className="flex-1 text-base woodblock-shadow-accent" onClick={onSubmit}>
                {t.submitOrder}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
