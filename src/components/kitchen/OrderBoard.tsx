import { useMemo } from 'react'
import { useOrderStore } from '@/stores/useOrderStore'
import OrderCard from './OrderCard'
import type { Language } from '@/types'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
  language: Language
}

export default function OrderBoard({ t, language }: Props) {
  const orders = useOrderStore((s) => s.orders)
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus)

  const unpaidOrders = useMemo(
    () => orders.filter((o) => o.status === 'created').sort((a, b) => a.createdAt - b.createdAt),
    [orders]
  )
  const preparingOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'paid' || o.status === 'preparing')
        .sort((a, b) => a.createdAt - b.createdAt),
    [orders]
  )
  const completedOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'completed')
        .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
        .slice(0, 20),
    [orders]
  )

  return (
    <div className="grid h-full grid-cols-1 gap-0 md:grid-cols-3">
      {/* Unpaid */}
      <div className="flex flex-col border-b border-warm-800/20 md:border-b-0 md:border-r">
        <div className="sticky top-0 flex items-center gap-2 bg-red-900/20 px-4 py-3 border-b border-red-500/20">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <h2 className="font-heading font-bold text-red-400 ink-text">
            {t.unpaid}
          </h2>
          <span className="ml-auto rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white font-mono">
            {unpaidOrders.length}
          </span>
        </div>
        <div className="flex flex-col gap-3 p-3">
          {unpaidOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              t={t}
              language={language}
              primaryAction={{
                label: t.markPaid,
                onClick: () => updateOrderStatus(order.id, 'paid'),
                variant: 'warning',
              }}
              secondaryAction={{
                label: t.markCancelled,
                onClick: () => {
                  if (confirm(t.confirmCancel)) {
                    updateOrderStatus(order.id, 'cancelled')
                  }
                },
                variant: 'destructive',
              }}
            />
          ))}
          {unpaidOrders.length === 0 && (
            <div className="py-8 text-center">
              <div className="brush-divider mx-auto w-16 mb-3" style={{ opacity: 0.2 }} />
              <p className="text-sm font-heading text-warm-600">{t.noData}</p>
            </div>
          )}
        </div>
      </div>

      {/* Preparing */}
      <div className="flex flex-col border-b border-warm-800/20 md:border-b-0 md:border-r">
        <div className="sticky top-0 flex items-center gap-2 bg-amber-900/20 px-4 py-3 border-b border-amber-500/20">
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <h2 className="font-heading font-bold text-amber-400 ink-text">{t.preparing}</h2>
          <span className="ml-auto rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white font-mono">
            {preparingOrders.length}
          </span>
        </div>
        <div className="flex flex-col gap-3 p-3">
          {preparingOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              t={t}
              language={language}
              primaryAction={{
                label: t.markCompleted,
                onClick: () => updateOrderStatus(order.id, 'completed'),
                variant: 'success',
              }}
            />
          ))}
          {preparingOrders.length === 0 && (
            <p className="py-8 text-center text-sm font-heading text-warm-600">
              {t.noData}
            </p>
          )}
        </div>
      </div>

      {/* Completed */}
      <div className="flex flex-col">
        <div className="sticky top-0 flex items-center gap-2 bg-emerald-900/20 px-4 py-3 border-b border-emerald-500/20">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <h2 className="font-heading font-bold text-emerald-400 ink-text">{t.completed}</h2>
          <span className="ml-auto rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white font-mono">
            {completedOrders.length}
          </span>
        </div>
        <div className="flex flex-col gap-3 p-3">
          {completedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              t={t}
              language={language}
              primaryAction={{
                label: t.markPickedUp,
                onClick: () => updateOrderStatus(order.id, 'picked_up'),
                variant: 'default',
              }}
            />
          ))}
          {completedOrders.length === 0 && (
            <p className="py-8 text-center text-sm font-heading text-warm-600">
              {t.noData}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
