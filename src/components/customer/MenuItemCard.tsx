import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/stores/useCartStore'
import { localized } from '@/lib/utils'
import type { MenuItem, Language } from '@/types'
import type { Translations } from '@/constants'

interface Props {
  item: MenuItem
  language: Language
  t: Translations
  onClick: () => void
}

export default function MenuItemCard({ item, language, t, onClick }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const name = localized(language, item.name, item.nameEn)
  const isSoldOut = !item.available || item.stock === 0

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSoldOut || item.options.length > 0) return
    addItem({
      menuItemId: item.id,
      name: item.name,
      nameEn: item.nameEn,
      price: item.price,
      quantity: 1,
      selectedOptions: [],
      notes: '',
    })
  }

  return (
    <div
      className={`menu-card tape-decoration relative cursor-pointer overflow-hidden border border-primary-200/60 bg-[#fdfcf8] organic-radius ${
        isSoldOut ? 'opacity-60' : ''
      }`}
      onClick={isSoldOut ? undefined : onClick}
    >
      <div className="p-3 pt-4">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-heading text-sm font-bold leading-tight ink-text">{name}</h3>
          {item.stock > 0 && item.stock <= 5 && (
            <Badge variant="warning" className="shrink-0 text-[10px]">
              {item.stock}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="mt-1 text-xs text-warm-500 line-clamp-1">
            {localized(language, item.description, item.descriptionEn)}
          </p>
        )}
        {/* 毛筆分隔線 */}
        <div className="brush-divider my-2 w-2/3" />
        <div className="flex items-center justify-between">
          {/* 朱印價格 */}
          <div className="price-stamp">
            <span className="text-[10px] leading-none">$</span>
            <span>{item.price}</span>
          </div>
          {!isSoldOut && item.options.length === 0 && (
            <button
              onClick={handleQuickAdd}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-600 text-white woodblock-shadow-accent transition-transform active:scale-90"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          {item.options.length > 0 && !isSoldOut && (
            <span className="flex items-center gap-1 text-xs text-warm-500 font-heading">
              <span className="flex gap-0.5">
                {Array.from({ length: Math.min(item.options.length, 3) }).map((_, i) => (
                  <span key={i} className="h-1 w-1 rounded-full bg-primary-400" />
                ))}
              </span>
              {t.options}
            </span>
          )}
        </div>
      </div>
      {isSoldOut && (
        <div className="absolute inset-0 flex items-center justify-center bg-warm-950/30">
          <span className="sold-stamp text-base font-bold rotate-[-12deg]">
            {t.soldOut}
          </span>
        </div>
      )}
    </div>
  )
}
