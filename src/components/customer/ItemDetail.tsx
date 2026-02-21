import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCartStore } from '@/stores/useCartStore'
import { localized } from '@/lib/utils'
import type { MenuItem, MenuOption, Language } from '@/types'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
  item: MenuItem
  language: Language
  onClose: () => void
}

export default function ItemDetail({ t, item, language, onClose }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([])
  const [notes, setNotes] = useState('')

  const name = localized(language, item.name, item.nameEn)
  const optionsTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0)
  const subtotal = (item.price + optionsTotal) * quantity

  const toggleOption = (option: MenuOption) => {
    setSelectedOptions((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    )
  }

  const handleAdd = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      nameEn: item.nameEn,
      price: item.price,
      quantity,
      selectedOptions,
      notes,
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl ink-text">{name}</DialogTitle>
          <DialogDescription>
            <span className="price-stamp inline-flex" style={{ width: 48, height: 48, fontSize: 13 }}>
              <span className="text-[9px] leading-none">$</span>
              <span>{item.price}</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        {item.description && (
          <p className="text-sm text-warm-500">
            {localized(language, item.description ?? '', item.descriptionEn)}
          </p>
        )}

        {item.stock > 0 && item.stock <= 5 && (
          <p className="text-xs text-amber-600 font-heading animate-pulse-soft">
            {t.stockLeft.replace('{n}', String(item.stock))}
          </p>
        )}

        {/* Options */}
        {item.options.length > 0 && (
          <div>
            <h4 className="mb-2 font-heading font-medium ink-text">{t.options}</h4>
            <div className="flex flex-col gap-2">
              {item.options.map((option) => {
                const optName = localized(language, option.name, option.nameEn)
                const isSelected = selectedOptions.some(
                  (o) => o.id === option.id
                )
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(option)}
                    className={`flex items-center justify-between organic-radius border-2 p-3 text-left transition-all active:scale-[0.97] ${
                      isSelected
                        ? 'border-primary-400 bg-primary-50 woodblock-shadow'
                        : 'border-warm-200 hover:border-primary-200'
                    }`}
                  >
                    <span className="font-heading font-medium">{optName}</span>
                    <span className="text-sm text-warm-500 font-heading">
                      +${option.price}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <h4 className="mb-2 font-heading font-medium ink-text">{t.notes}</h4>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            className="resize-none organic-radius"
            rows={2}
          />
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="font-heading font-medium ink-text">{t.quantity}</span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="organic-radius"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus />
            </Button>
            <span className="w-8 text-center text-lg font-heading font-bold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="organic-radius-alt"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus />
            </Button>
          </div>
        </div>

        {/* 毛筆分隔線 */}
        <div className="brush-divider w-full" />

        {/* Add Button */}
        <Button size="lg" className="w-full text-base bg-accent-600 hover:bg-accent-700 text-white woodblock-shadow-accent" onClick={handleAdd}>
          {t.addToCart} - <span className="font-heading font-bold">${subtotal}</span>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
