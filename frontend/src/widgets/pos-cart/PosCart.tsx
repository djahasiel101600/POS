import { useCartStore } from '@/app/store/cartStore'
import { cn, formatCurrency } from '@/shared/lib/utils'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem } from '@/shared/types'

interface PosCartProps {
  onCheckout: () => void
  taxRate: number
}

export function PosCart({ onCheckout, taxRate }: PosCartProps) {
  const { items, discount, removeItem, updateQuantity, clearCart } = useCartStore()
  const subtotal = useCartStore((s) => s.subtotal())
  const taxAmount = (subtotal - discount) * taxRate / 100
  const total = subtotal - discount + taxAmount

  return (
    <div className="flex flex-col h-full bg-card border-l">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-base">Cart</h2>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-destructive hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto divide-y">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-12">
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs">Tap a product to add</p>
          </div>
        ) : (
          items.map((item) => <CartItemRow key={item.product.id} item={item} />)
        )}
      </div>

      {/* Totals */}
      {items.length > 0 && (
        <div className="border-t p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full bg-primary text-primary-foreground rounded-xl py-4 text-base font-bold hover:bg-primary/90 active:scale-95 transition-all mt-2"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  )
}

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore()
  const lineTotal = parseFloat(item.product.selling_price) * item.quantity - item.line_discount

  return (
    <div className="px-4 py-3 flex gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.product.name}</p>
        <p className="text-xs text-muted-foreground">
          ₱{parseFloat(item.product.selling_price).toFixed(2)} each
        </p>
        <p className="text-sm font-semibold text-primary mt-0.5">
          {formatCurrency(lineTotal)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => removeItem(item.product.id)}
          className="text-destructive p-1 rounded hover:bg-destructive/10"
        >
          <Trash2 size={14} />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
            className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-secondary"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
            className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-secondary"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
