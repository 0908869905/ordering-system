import { useState } from 'react'
import { cn, localized } from '@/lib/utils'
import type { Category, MenuItem, Language } from '@/types'
import type { Translations } from '@/constants'
import MenuItemCard from './MenuItemCard'
import ItemDetail from './ItemDetail'

interface Props {
  t: Translations
  categories: Category[]
  items: MenuItem[]
  language: Language
}

export default function MenuGrid({ t, categories, items, language }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
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
      {/* Category Tabs - 膠囊形 */}
      <div className="sticky top-[57px] z-20 flex gap-2 overflow-x-auto border-b border-warm-200 bg-warm-50 px-4 py-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'touch-target shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            selectedCategory === null
              ? 'bg-primary-500 text-white'
              : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
          )}
        >
          {t.allCategories}
        </button>
        {sortedCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'touch-target shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selectedCategory === cat.id
                ? 'bg-primary-500 text-white'
                : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
            )}
          >
            {localized(language, cat.name, cat.nameEn)}
          </button>
        ))}
      </div>

      {/* Items */}
      {groupedItems ? (
        // Show grouped by category with section titles
        <div className="p-4 space-y-6">
          {groupedItems.map((group) => (
            <div key={group.category.id}>
              {/* 日式分類標題 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary-200" />
                <h2 className="font-heading text-lg font-semibold text-warm-800 shrink-0">
                  {localized(language, group.category.name, group.category.nameEn)}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary-200" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {group.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    language={language}
                    t={t}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show flat grid for selected category
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
          {sortedItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              language={language}
              t={t}
              onClick={() => setSelectedItem(item)}
            />
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
