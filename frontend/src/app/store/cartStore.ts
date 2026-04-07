import { create } from 'zustand'
import type { CartItem, Product } from '@/shared/types'

interface CartState {
  items: CartItem[]
  discount: number
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  updateLineDiscount: (productId: number, discount: number) => void
  setDiscount: (amount: number) => void
  clearCart: () => void
  subtotal: () => number
  totalItems: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return { items: [...state.items, { product, quantity: 1, line_discount: 0 }] }
    })
  },

  removeItem: (productId) => {
    set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) }))
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    }))
  },

  updateLineDiscount: (productId, discount) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, line_discount: discount } : i
      ),
    }))
  },

  setDiscount: (amount) => set({ discount: amount }),

  clearCart: () => set({ items: [], discount: 0 }),

  subtotal: () => {
    return get().items.reduce((sum, item) => {
      const lineTotal = parseFloat(item.product.selling_price) * item.quantity - item.line_discount
      return sum + lineTotal
    }, 0)
  },

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}))
