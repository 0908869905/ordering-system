import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, MenuItem } from '@/types'
import { defaultCategories, defaultMenuItems } from '@/constants'

interface MenuState {
  categories: Category[]
  items: MenuItem[]
  initialized: boolean

  // Category CRUD
  addCategory: (category: Omit<Category, 'id' | 'order'>) => void
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (ids: string[]) => void

  // Item CRUD
  addItem: (item: Omit<MenuItem, 'id' | 'order'>) => void
  updateItem: (id: string, data: Partial<Omit<MenuItem, 'id'>>) => void
  deleteItem: (id: string) => void
  reorderItems: (categoryId: string, ids: string[]) => void

  // Inventory
  setItemAvailability: (id: string, available: boolean) => void
  setItemStock: (id: string, stock: number) => void
  decrementStock: (id: string, quantity: number) => void
  resetAllStock: () => void

  // Sync
  replaceAll: (categories: Category[], items: MenuItem[]) => void
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,
      items: defaultMenuItems,
      initialized: true,

      addCategory: (data) => {
        const { categories } = get()
        const newCategory: Category = {
          ...data,
          id: `cat-${generateId()}`,
          order: categories.length,
        }
        set({ categories: [...categories, newCategory] })
      },

      updateCategory: (id, data) => {
        set({
          categories: get().categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })
      },

      deleteCategory: (id) => {
        set({
          categories: get().categories.filter((c) => c.id !== id),
          items: get().items.filter((i) => i.categoryId !== id),
        })
      },

      reorderCategories: (ids) => {
        const { categories } = get()
        const reordered = ids
          .map((id, index) => {
            const cat = categories.find((c) => c.id === id)
            return cat ? { ...cat, order: index } : null
          })
          .filter((c): c is Category => c !== null)
        set({ categories: reordered })
      },

      addItem: (data) => {
        const { items } = get()
        const categoryItems = items.filter((i) => i.categoryId === data.categoryId)
        const newItem: MenuItem = {
          ...data,
          id: `item-${generateId()}`,
          order: categoryItems.length,
        }
        set({ items: [...items, newItem] })
      },

      updateItem: (id, data) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, ...data } : i
          ),
        })
      },

      deleteItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      reorderItems: (categoryId, ids) => {
        const { items } = get()
        const otherItems = items.filter((i) => i.categoryId !== categoryId)
        const reorderedItems = ids
          .map((id, index) => {
            const item = items.find((i) => i.id === id)
            return item ? { ...item, order: index } : null
          })
          .filter((i): i is MenuItem => i !== null)
        set({ items: [...otherItems, ...reorderedItems] })
      },

      setItemAvailability: (id, available) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, available } : i
          ),
        })
      },

      setItemStock: (id, stock) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, stock, available: stock !== 0 } : i
          ),
        })
      },

      decrementStock: (id, quantity) => {
        set({
          items: get().items.map((i) => {
            if (i.id !== id || i.stock === -1) return i
            const newStock = Math.max(0, i.stock - quantity)
            return { ...i, stock: newStock, available: newStock > 0 }
          }),
        })
      },

      resetAllStock: () => {
        set({
          items: get().items.map((i) => ({ ...i, stock: -1, available: true })),
        })
      },

      replaceAll: (categories, items) => {
        set({ categories, items })
      },
    }),
    {
      name: 'ordering-menu',
    }
  )
)
