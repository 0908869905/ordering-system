import { Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
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
    <Card
      className={`menu-card relative cursor-pointer overflow-hidden border-l-[3px] border-l-primary-300 ${
        isSoldOut ? 'opacity-60' : ''
      }`}
      onClick={isSoldOut ? undefined : onClick}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-body text-sm font-bold leading-tight">{name}</h3>
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
        <div className="mt-2 flex items-center justify-between">
          <span className="font-heading text-base font-bold text-accent-600">
            ${item.price}
          </span>
          {!isSoldOut && item.options.length === 0 && (
            <button
              onClick={handleQuickAdd}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-600 text-white transition-transform active:scale-90"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          {item.options.length > 0 && !isSoldOut && (
            <span className="text-xs text-warm-500">
              {t.options}
            </span>
          )}
        </div>
      </div>
      {isSoldOut && (
        <div className="absolute inset-0 flex items-center justify-center bg-warm-950/40">
          <span className="font-heading text-lg font-bold text-white border-2 border-white rounded-lg px-3 py-1 rotate-[-12deg]">
            {t.soldOut}
          </span>
        </div>
      )}
    </Card>
  )
}
