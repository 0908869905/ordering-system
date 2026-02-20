import { useState } from 'react'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useMenuStore } from '@/stores/useMenuStore'
import { useCartStore } from '@/stores/useCartStore'
import { useOrderStore } from '@/stores/useOrderStore'
import { broadcastLocal } from '@/lib/peer'
import MenuGrid from './MenuGrid'
import Cart from './Cart'
import OrderSuccess from './OrderSuccess'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
}

export default function CustomerView({ t }: Props) {
  const { setCurrentView, language } = useSettingsStore()
  const { categories, items } = useMenuStore()
  const cartItems = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const getItemCount = useCartStore((s) => s.getItemCount)
  const clearCart = useCartStore((s) => s.clearCart)
  const createOrder = useOrderStore((s) => s.createOrder)
  const decrementStock = useMenuStore((s) => s.decrementStock)

  const [showCart, setShowCart] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<{
    orderNumber: number
    totalAmount: number
  } | null>(null)

  const handleSubmitOrder = () => {
    if (cartItems.length === 0) return
    const total = getTotal()
    const order = createOrder(cartItems, total)

    // Decrement stock
    for (const item of cartItems) {
      decrementStock(item.menuItemId, item.quantity)
    }

    // Broadcast to other tabs/devices
    broadcastLocal('NEW_ORDER', order)

    setCompletedOrder({
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
    })
    clearCart()
    setShowCart(false)
  }

  if (completedOrder) {
    return (
      <OrderSuccess
        t={t}
        orderNumber={completedOrder.orderNumber}
        totalAmount={completedOrder.totalAmount}
        onContinue={() => setCompletedOrder(null)}
        onBackToHome={() => {
          setCompletedOrder(null)
          setCurrentView('landing')
        }}
      />
    )
  }

  const itemCount = getItemCount()

  return (
    <div className="flex min-h-dvh flex-col no-select">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-warm-200 bg-white/90 px-4 py-3 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView('landing')}
        >
          <ArrowLeft />
        </Button>
        <h1 className="flex-1 font-heading text-lg font-bold">{t.menu}</h1>
        <span className="font-decorative text-sm text-primary-500 tracking-wider">宏麵屋</span>
      </header>

      {/* Menu */}
      <div className="flex-1 pb-20">
        <MenuGrid
          t={t}
          categories={categories}
          items={items}
          language={language}
        />
      </div>

      {/* Cart Floating Bar */}
      {itemCount > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-warm-200 bg-warm-50/95 p-3 shadow-lg floating-bar backdrop-blur">
          <Button
            className="w-full bg-accent-600 hover:bg-accent-700 text-white"
            size="lg"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="!size-5" />
            <span>{t.cart}</span>
            <Badge variant="secondary" className="ml-1 bg-white/20 text-white border-0">
              {itemCount}
            </Badge>
            <span className="ml-auto font-heading font-bold">${getTotal()}</span>
          </Button>
        </div>
      )}

      {/* Cart Panel */}
      {showCart && (
        <Cart
          t={t}
          language={language}
          onClose={() => setShowCart(false)}
          onSubmit={handleSubmitOrder}
        />
      )}
    </div>
  )
}
