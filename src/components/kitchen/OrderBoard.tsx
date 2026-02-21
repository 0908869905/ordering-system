import { useMemo, useState } from 'react'
import { Receipt } from 'lucide-react'
import { useOrderStore } from '@/stores/useOrderStore'
import OrderCard from './OrderCard'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { Language } from '@/types'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
  language: Language
}

export default function OrderBoard({ t, language }: Props) {
  const orders = useOrderStore((s) => s.orders)
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus)

  const [cancelTarget, setCancelTarget] = useState<string | null>(null)

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

  const todayStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = today.getTime()
    const todayOrders = orders.filter(
      (o) => o.createdAt >= todayStart && o.status !== 'cancelled'
    )
    const revenue = todayOrders
      .filter((o) => o.status === 'completed' || o.status === 'picked_up')
      .reduce((sum, o) => sum + o.totalAmount, 0)
    return { count: todayOrders.length, revenue }
  }, [orders])

  return (
    <div className="flex h-full flex-col">
      {/* Daily Summary */}
      <div className="flex items-center gap-4 border-b border-warm-800/20 bg-[#252118] px-4 py-2">
        <Receipt className="h-4 w-4 text-primary-400" />
        <span className="text-xs font-heading text-warm-400">
          {language === 'zh' ? '今日' : 'Today'}
        </span>
        <span className="font-mono text-sm font-bold text-warm-200">
          {todayStats.count} {language === 'zh' ? '單' : 'orders'}
        </span>
        <div className="h-3 w-px bg-warm-700/50" />
        <span className="font-mono text-sm font-bold text-primary-400">
          ${todayStats.revenue}
        </span>
      </div>
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 md:grid-cols-3">
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
                onClick: () => setCancelTarget(order.id),
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
            <div className="py-8 text-center">
              <div className="brush-divider mx-auto w-16 mb-3" style={{ opacity: 0.2 }} />
              <p className="text-sm font-heading text-warm-600">{t.noData}</p>
            </div>
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
            <div className="py-8 text-center">
              <div className="brush-divider mx-auto w-16 mb-3" style={{ opacity: 0.2 }} />
              <p className="text-sm font-heading text-warm-600">{t.noData}</p>
            </div>
          )}
        </div>
      </div>
    </div>

      <ConfirmDialog
        open={!!cancelTarget}
        message={t.confirmCancel}
        confirmLabel={t.confirm}
        cancelLabel={t.back}
        onConfirm={() => { if (cancelTarget) updateOrderStatus(cancelTarget, 'cancelled'); setCancelTarget(null) }}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  )
}
