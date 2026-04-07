import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { salesApi } from '@/entities/sale/api/salesApi'
import { useCartStore } from '@/app/store/cartStore'
import type { Sale } from '@/shared/types'
import { formatCurrency } from '@/shared/lib/utils'
import { X } from 'lucide-react'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (sale: Sale) => void
  taxRate: number
}

type Step = 'payment' | 'cash-input' | 'success'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'gcash', label: 'GCash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
]

export function CheckoutModal({ open, onClose, onSuccess, taxRate }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('payment')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState('')
  const [error, setError] = useState('')
  const { items, discount, clearCart, subtotal } = useCartStore()
  const qc = useQueryClient()

  const sub = subtotal()
  const taxAmount = (sub - discount) * taxRate / 100
  const total = sub - discount + taxAmount
  const change = parseFloat(cashReceived || '0') - total

  const mutation = useMutation({
    mutationFn: salesApi.create,
    onSuccess: (sale) => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      clearCart()
      setStep('success')
      onSuccess(sale)
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail || 'Checkout failed. Please try again.')
    },
  })

  const handleSubmit = () => {
    setError('')
    if (paymentMethod === 'cash' && parseFloat(cashReceived || '0') < total) {
      setError('Cash received is less than total amount.')
      return
    }
    mutation.mutate({
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
        line_discount: i.line_discount,
      })),
      payment_method: paymentMethod,
      cash_received: paymentMethod === 'cash' ? parseFloat(cashReceived) : undefined,
      discount_amount: discount,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Checkout</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Order summary */}
          <div className="bg-secondary rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(sub)}</span>
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
          </div>

          {/* Payment method */}
          <div>
            <p className="text-sm font-medium mb-2">Payment Method</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                    paymentMethod === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Cash received input */}
          {paymentMethod === 'cash' && (
            <div>
              <p className="text-sm font-medium mb-2">Cash Received</p>
              <input
                type="number"
                min={total}
                step="0.01"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder={total.toFixed(2)}
                className="w-full border rounded-xl px-4 py-3 text-xl text-right font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {cashReceived && parseFloat(cashReceived) >= total && (
                <p className="text-right text-sm text-green-600 mt-1 font-medium">
                  Change: {formatCurrency(change)}
                </p>
              )}
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <div className="p-5 border-t">
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="w-full bg-primary text-primary-foreground rounded-xl py-4 text-base font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? 'Processing...' : `Confirm Payment · ${formatCurrency(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
