import { useMemo, useState } from 'react'
import { DollarSign, ShoppingBag, TrendingUp, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useOrderStore } from '@/stores/useOrderStore'
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
      <div className="flex flex-1 items-center justify-center p-8 text-[hsl(var(--muted-foreground))]">
        {t.noOrders}
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="mx-auto mb-1 h-6 w-6 text-[hsl(var(--success))]" />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {t.totalRevenue}
            </p>
            <p className="font-heading text-2xl font-black text-[hsl(var(--success))]">
              ${stats.totalRevenue}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="mx-auto mb-1 h-6 w-6 text-[hsl(var(--primary))]" />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {t.totalOrders}
            </p>
            <p className="font-heading text-2xl font-black">{stats.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-1 h-6 w-6 text-[hsl(var(--warning))]" />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {t.averageOrder}
            </p>
            <p className="font-heading text-2xl font-black">${stats.averageOrder}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Items */}
      {stats.topItems.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.topItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topItems.map((item, idx) => {
                const name =
                  language === 'en' && item.nameEn ? item.nameEn : item.name
                const widthPercent =
                  (item.quantity / (stats.topItems[0]?.quantity ?? 1)) * 100
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-6 text-right text-sm font-bold text-[hsl(var(--muted-foreground))]">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{name}</span>
                        <span className="text-[hsl(var(--muted-foreground))]">
                          {item.quantity} {t.salesQuantity} / ${item.revenue}
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                        <div
                          className="h-full rounded-full bg-[hsl(var(--primary))]"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hourly Distribution */}
      {Object.keys(stats.hourlyOrders).length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.hourlyDistribution}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end gap-1">
              {Array.from({ length: 24 }, (_, h) => {
                const count = stats.hourlyOrders[h] ?? 0
                const height =
                  count > 0 ? (count / maxHourlyOrders) * 100 : 0
                return (
                  <div key={h} className="flex flex-1 flex-col items-center">
                    <div
                      className="w-full rounded-t bg-primary-400 transition-all"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                    />
                    {h % 3 === 0 && (
                      <span className="mt-1 text-[9px] text-[hsl(var(--muted-foreground))]">
                        {h}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Adjustments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.manualAdjust}</CardTitle>
        </CardHeader>
        <CardContent>
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
              <span>
                {adj.reason}:{' '}
                <span
                  className={
                    adj.amount >= 0
                      ? 'text-[hsl(var(--success))]'
                      : 'text-[hsl(var(--destructive))]'
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
        </CardContent>
      </Card>
    </div>
  )
}
