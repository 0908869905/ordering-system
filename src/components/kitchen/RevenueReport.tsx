import { useMemo, useState } from 'react'
import { DollarSign, ShoppingBag, TrendingUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useOrderStore } from '@/stores/useOrderStore'
import { localized } from '@/lib/utils'
import type { Language } from '@/types'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
  language: Language
}

export default function RevenueReport({ t, language }: Props) {
  const orders = useOrderStore((s) => s.orders)
  const revenueAdjustments = useOrderStore((s) => s.revenueAdjustments)
  const addRevenueAdjustment = useOrderStore((s) => s.addRevenueAdjustment)
  const removeRevenueAdjustment = useOrderStore((s) => s.removeRevenueAdjustment)

  const [adjAmount, setAdjAmount] = useState('')
  const [adjReason, setAdjReason] = useState('')

  const stats = useMemo(() => {
    const paidOrders = orders.filter((o) =>
      ['paid', 'preparing', 'completed', 'picked_up'].includes(o.status)
    )

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const orderCount = paidOrders.length
    const averageOrder = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0

    // Item sales
    const itemSales: Record<
      string,
      { name: string; nameEn?: string; quantity: number; revenue: number }
    > = {}
    for (const order of paidOrders) {
      for (const item of order.items) {
        const key = item.menuItemId
        if (!itemSales[key]) {
          itemSales[key] = {
            name: item.name,
            nameEn: item.nameEn,
            quantity: 0,
            revenue: 0,
          }
        }
        itemSales[key]!.quantity += item.quantity
        itemSales[key]!.revenue += item.subtotal
      }
    }

    // Sort by quantity
    const topItems = Object.values(itemSales).sort(
      (a, b) => b.quantity - a.quantity
    )

    // Hourly distribution
    const hourlyOrders: Record<number, number> = {}
    for (const order of paidOrders) {
      const hour = new Date(order.createdAt).getHours()
      hourlyOrders[hour] = (hourlyOrders[hour] ?? 0) + 1
    }

    // Revenue adjustments total
    const adjustmentsTotal = revenueAdjustments.reduce(
      (sum, a) => sum + a.amount,
      0
    )

    return {
      totalRevenue: totalRevenue + adjustmentsTotal,
      baseRevenue: totalRevenue,
      adjustmentsTotal,
      orderCount,
      averageOrder,
      topItems,
      hourlyOrders,
    }
  }, [orders, revenueAdjustments])

  const handleAddAdjustment = () => {
    const amount = parseInt(adjAmount)
    if (isNaN(amount) || !adjReason.trim()) return
    addRevenueAdjustment(amount, adjReason.trim())
    setAdjAmount('')
    setAdjReason('')
  }

  const maxHourlyOrders = Math.max(...Object.values(stats.hourlyOrders), 1)

  if (stats.orderCount === 0 && revenueAdjustments.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <div className="brush-divider w-16" style={{ opacity: 0.2 }} />
        <p className="text-warm-600 font-heading">{t.noOrders}</p>
      </div>
    )
  }

  return (
    <div className="p-4 animate-fade-in">
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="organic-radius border border-warm-800/30 bg-[#2e2a22] p-4 text-center">
          <DollarSign className="mx-auto mb-1 h-6 w-6 text-emerald-400" />
          <p className="text-xs text-warm-500 font-heading">
            {t.totalRevenue}
          </p>
          <p className="font-heading text-2xl font-black text-emerald-400 ink-text">
            ${stats.totalRevenue}
          </p>
        </div>
        <div className="organic-radius-alt border border-warm-800/30 bg-[#2e2a22] p-4 text-center">
          <ShoppingBag className="mx-auto mb-1 h-6 w-6 text-primary-400" />
          <p className="text-xs text-warm-500 font-heading">
            {t.totalOrders}
          </p>
          <p className="font-heading text-2xl font-black text-primary-400 ink-text">{stats.orderCount}</p>
        </div>
        <div className="organic-radius border border-warm-800/30 bg-[#2e2a22] p-4 text-center">
          <TrendingUp className="mx-auto mb-1 h-6 w-6 text-amber-400" />
          <p className="text-xs text-warm-500 font-heading">
            {t.averageOrder}
          </p>
          <p className="font-heading text-2xl font-black text-amber-400 ink-text">${stats.averageOrder}</p>
        </div>
      </div>

      {/* Top Items */}
      {stats.topItems.length > 0 && (
        <div className="mb-6 organic-radius-alt border border-warm-800/30 bg-[#2e2a22] p-4">
          <h3 className="mb-3 text-base font-heading font-bold text-primary-400 ink-text">{t.topItems}</h3>
          <div className="space-y-2">
            {stats.topItems.map((item, idx) => {
              const name = localized(language, item.name, item.nameEn)
              const widthPercent =
                (item.quantity / (stats.topItems[0]?.quantity ?? 1)) * 100
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-6 text-right text-sm font-bold font-mono text-warm-500">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-heading font-medium">{name}</span>
                      <span className="text-warm-500 font-mono text-xs">
                        {item.quantity} {t.salesQuantity} / ${item.revenue}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden organic-radius bg-warm-800/50">
                      <div
                        className="h-full organic-radius bg-primary-400 origin-left"
                        style={{
                          width: `${widthPercent}%`,
                          animation: `bar-grow 0.6s ease-out ${idx * 0.1}s both`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Hourly Distribution */}
      {Object.keys(stats.hourlyOrders).length > 0 && (
        <div className="mb-6 organic-radius border border-warm-800/30 bg-[#2e2a22] p-4">
          <h3 className="mb-3 text-base font-heading font-bold text-primary-400 ink-text">{t.hourlyDistribution}</h3>
          <div className="flex h-32 items-end gap-1">
            {Array.from({ length: 24 }, (_, h) => {
              const count = stats.hourlyOrders[h] ?? 0
              const height =
                count > 0 ? (count / maxHourlyOrders) * 100 : 0
              return (
                <div key={h} className="flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t bg-primary-400/80 origin-bottom"
                    style={{
                      height: `${height}%`,
                      minHeight: count > 0 ? '4px' : '0',
                      animation: count > 0 ? `bar-grow 0.5s ease-out ${h * 0.03}s both` : 'none',
                      transformOrigin: 'bottom',
                    }}
                  />
                  {h % 2 === 0 && (
                    <span className="mt-1 text-[9px] text-warm-600 font-mono">
                      {h}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Revenue Adjustments */}
      <div className="organic-radius-alt border border-warm-800/30 bg-[#2e2a22] p-4">
        <h3 className="mb-3 text-base font-heading font-bold text-primary-400 ink-text">{t.manualAdjust}</h3>
        <div className="mb-3 flex gap-2">
          <Input
            type="number"
            placeholder={t.adjustAmount}
            value={adjAmount}
            onChange={(e) => setAdjAmount(e.target.value)}
            className="h-9"
          />
          <Input
            placeholder={t.adjustReason}
            value={adjReason}
            onChange={(e) => setAdjReason(e.target.value)}
            className="h-9"
          />
          <Button size="sm" onClick={handleAddAdjustment}>
            <Plus className="!size-4" />
          </Button>
        </div>
        {revenueAdjustments.map((adj) => (
          <div
            key={adj.id}
            className="flex items-center justify-between py-1 text-sm"
          >
            <span className="font-heading">
              {adj.reason}:{' '}
              <span
                className={
                  adj.amount >= 0
                    ? 'text-emerald-400'
                    : 'text-accent-500'
                }
              >
                {adj.amount >= 0 ? '+' : ''}${adj.amount}
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => removeRevenueAdjustment(adj.id)}
            >
              <Trash2 className="!size-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
