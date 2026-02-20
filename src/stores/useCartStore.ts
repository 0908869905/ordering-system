import { create } from 'zustand'
import type { CartItem, MenuOption } from '@/types'

interface CartState {
  items: CartItem[]

  addItem: (params: {
    menuItemId: string
    name: string
    nameEn?: string
    price: number
    quantity: number
    selectedOptions: MenuOption[]
    notes: string
  }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

function generateId() {
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function calcSubtotal(price: number, quantity: number, options: MenuOption[]) {
  const optionsTotal = options.reduce((sum, o) => sum + o.price, 0)
  return (price + optionsTotal) * quantity
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],

  addItem: (params) => {
    const { items } = get()
    // Check if same item with same options and notes exists
    const existing = items.find(
      (i) =>
        i.menuItemId === params.menuItemId &&
        i.notes === params.notes &&
        JSON.stringify(i.selectedOptions.map((o) => o.id).sort()) ===
          JSON.stringify(params.selectedOptions.map((o) => o.id).sort())
    )

    if (existing) {
      const newQty = existing.quantity + params.quantity
      set({
        items: items.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantity: newQty,
                subtotal: calcSubtotal(i.price, newQty, i.selectedOptions),
              }
            : i
        ),
      })
    } else {
      const newItem: CartItem = {
        id: generateId(),
        menuItemId: params.menuItemId,
        name: params.name,
        nameEn: params.nameEn,
        price: params.price,
        quantity: params.quantity,
        selectedOptions: params.selectedOptions,
        notes: params.notes,
        subtotal: calcSubtotal(params.price, params.quantity, params.selectedOptions),
      }
      set({ items: [...items, newItem] })
    }
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) })
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      set({ items: get().items.filter((i) => i.id !== id) })
      return
    }
    set({
      items: get().items.map((i) =>
        i.id === id
          ? { ...i, quantity, subtotal: calcSubtotal(i.price, quantity, i.selectedOptions) }
          : i
      ),
    })
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),

  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
