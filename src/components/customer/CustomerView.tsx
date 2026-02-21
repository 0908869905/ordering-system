import { useState, useEffect, useCallback, useRef } from 'react'
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
  const { language } = useSettingsStore()
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

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null)

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast((prev) => prev ? { ...prev, visible: false } : null), 1800)
    setTimeout(() => setToast(null), 2100)
  }, [])

  // Listen for cart additions via ref tracking
  const prevCountRef = useRef(useCartStore.getState().items.length)
  useEffect(() => {
    const unsub = useCartStore.subscribe((state) => {
      const curr = state.items.length
      if (curr > prevCountRef.current) {
        showToast(language === 'zh' ? '已加入購物車！' : 'Added to cart!')
      }
      prevCountRef.current = curr
    })
    return unsub
  }, [showToast, language])

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
          window.location.href = '/'
        }}
      />
    )
  }

  const itemCount = getItemCount()

  return (
    <div className="washi-overlay flex min-h-dvh flex-col no-select">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-primary-200/40 bg-[#fdfcf8]/90 px-4 py-3 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft />
        </Button>
        <h1 className="flex-1 font-heading text-lg font-bold ink-text">{t.menu}</h1>
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

      {/* Cart Floating Bar — 暖簾風格 */}
      {itemCount > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 z-40 noren-edge bg-[#fdfcf8]/95 p-3 floating-bar backdrop-blur border-t border-primary-200/40">
          <Button
            className="w-full bg-accent-600 hover:bg-accent-700 text-white woodblock-shadow-accent"
            size="lg"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="!size-5" />
            <span className="font-heading">{t.cart}</span>
            <Badge key={itemCount} variant="secondary" className="ml-1 bg-white/20 text-white border-0 badge-pop">
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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 ${toast.visible ? 'toast-enter' : 'toast-exit'}`}>
          <div className="bg-warm-900/90 text-white px-5 py-2.5 organic-radius font-heading text-sm backdrop-blur whitespace-nowrap">
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}
