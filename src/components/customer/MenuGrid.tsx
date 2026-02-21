import { useState } from 'react'
import { localized } from '@/lib/utils'
import type { Category, MenuItem, Language } from '@/types'
import type { Translations } from '@/constants'
import MenuItemCard from './MenuItemCard'
import ItemDetail from './ItemDetail'

interface Props {
  t: Translations
  categories: Category[]
  items: MenuItem[]
  language: Language
  selectedCategory: string | null
}

export default function MenuGrid({ t, categories, items, language, selectedCategory }: Props) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)
  const filteredItems = selectedCategory
    ? items.filter((i) => i.categoryId === selectedCategory)
    : items
  const sortedItems = [...filteredItems].sort((a, b) => a.order - b.order)

  // Group items by category for display when "all" is selected
  const groupedItems = selectedCategory
    ? null
    : sortedCategories
        .map((cat) => ({
          category: cat,
          items: items
            .filter((i) => i.categoryId === cat.id)
            .sort((a, b) => a.order - b.order),
        }))
        .filter((g) => g.items.length > 0)

  return (
    <>
      {/* Items */}
      {groupedItems ? (
        // Show grouped by category with section titles
        <div className="p-4 space-y-6">
          {groupedItems.map((group) => (
            <div key={group.category.id}>
              {/* 日式分類標題 — 毛筆線 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="brush-divider flex-1" />
                <h2 className="font-heading text-lg font-semibold text-warm-800 shrink-0 ink-text">
                  {localized(language, group.category.name, group.category.nameEn)}
                </h2>
                <div className="brush-divider flex-1" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {group.items.map((item, idx) => (
                  <div key={item.id} className="stagger-item" style={{ animationDelay: `${idx * 0.06}s` }}>
                    <MenuItemCard
                      item={item}
                      language={language}
                      t={t}
                      onClick={() => setSelectedItem(item)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show flat grid for selected category
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
          {sortedItems.map((item, idx) => (
            <div key={item.id} className="stagger-item" style={{ animationDelay: `${idx * 0.05}s` }}>
              <MenuItemCard
                item={item}
                language={language}
                t={t}
                onClick={() => setSelectedItem(item)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Item Detail Dialog */}
      {selectedItem && (
        <ItemDetail
          t={t}
          item={selectedItem}
          language={language}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  )
}
