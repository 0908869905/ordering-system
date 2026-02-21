import { useState } from 'react'
import { Package, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useMenuStore } from '@/stores/useMenuStore'
import { localized } from '@/lib/utils'
import type { Language } from '@/types'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
  language: Language
}

function getStockBadgeVariant(
  available: boolean,
  stock: number
): 'destructive' | 'secondary' | 'warning' | 'success' {
  if (!available) return 'destructive'
  if (stock === -1) return 'secondary'
  if (stock <= 5) return 'warning'
  return 'success'
}

export default function InventoryPanel({ t, language }: Props) {
  const { categories, items, setItemAvailability, setItemStock, resetAllStock } =
    useMenuStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  const handleSaveStock = (itemId: string) => {
    const value = parseInt(editValue)
    if (!isNaN(value) && value >= -1) {
      setItemStock(itemId, value)
    }
    setEditingId(null)
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold ink-text">
          <Package className="h-5 w-5" />
          {t.inventory}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm(t.confirmResetInventory)) {
              resetAllStock()
            }
          }}
        >
          <RotateCcw className="!size-4" />
          {t.resetAll}
        </Button>
      </div>

      {sortedCategories.map((cat) => {
        const catItems = items
          .filter((i) => i.categoryId === cat.id)
          .sort((a, b) => a.order - b.order)

        if (catItems.length === 0) return null

        return (
          <div key={cat.id} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="brush-divider flex-1" style={{ opacity: 0.3 }} />
              <h3 className="font-heading font-semibold text-warm-500 shrink-0">
                {localized(language, cat.name, cat.nameEn)}
              </h3>
              <div className="brush-divider flex-1" style={{ opacity: 0.3 }} />
            </div>
            <div className="flex flex-col gap-2">
              {catItems.map((item) => {
                const name = localized(language, item.name, item.nameEn)
                return (
                  <div key={item.id} className="organic-radius border border-warm-800/30 bg-[#2e2a22] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <span className="font-heading font-medium">{name}</span>
                        <span className="ml-2 text-sm text-warm-600 font-mono">
                          ${item.price}
                        </span>
                      </div>

                      {/* Stock Display/Edit */}
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-9 w-20"
                            min={-1}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveStock(item.id)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveStock(item.id)}
                          >
                            {t.save}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              getStockBadgeVariant(item.available, item.stock)
                            }
                            className="cursor-pointer hover:ring-2 hover:ring-primary-400/50 transition-all"
                            onClick={() => {
                              setEditingId(item.id)
                              setEditValue(item.stock.toString())
                            }}
                          >
                            {item.stock === -1
                              ? t.unlimited
                              : `${t.stock}: ${item.stock}`}
                          </Badge>

                          {item.available ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-accent-500 border-accent-500/30 hover:bg-accent-500/10"
                              onClick={() =>
                                setItemAvailability(item.id, false)
                              }
                            >
                              {t.markSoldOut}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                              onClick={() =>
                                setItemAvailability(item.id, true)
                              }
                            >
                              {t.restoreAvailable}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
