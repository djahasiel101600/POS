import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salesApi } from '@/entities/sale/api/salesApi'
import { useState } from 'react'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import type { Sale } from '@/shared/types'

export function SalesHistoryPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null)
  const qc = useQueryClient()

  const params = {
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['sales', params],
    queryFn: () => salesApi.getAll(params),
  })

  const voidMutation = useMutation({
    mutationFn: (id: number) => salesApi.void(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }),
  })

  const sales = data?.results ?? []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sales History</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left px-4 py-3">Receipt #</th>
              <th className="text-left px-4 py-3">Cashier</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Method</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : sales.map((s) => (
              <tr key={s.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{s.receipt_number}</td>
                <td className="px-4 py-3">{s.cashier_name}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(s.total_amount)}</td>
                <td className="px-4 py-3 capitalize">{s.payment_method}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.status === 'completed' ? 'bg-green-100 text-green-800' :
                    s.status === 'voided' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => setReceiptSale(s)} className="text-xs text-primary hover:underline">Receipt</button>
                  {s.status === 'completed' && (
                    <button onClick={() => voidMutation.mutate(s.id)} className="text-xs text-destructive hover:underline">Void</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipt modal */}
      {receiptSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="font-bold text-center mb-4">Receipt</h2>
            <p className="text-center text-xs text-muted-foreground mb-4">{receiptSale.receipt_number}</p>
            <div className="space-y-2 text-sm border-t border-b py-3 mb-3">
              {receiptSale.items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product_name_snapshot} x{item.quantity}</span>
                  <span>{formatCurrency(item.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(receiptSale.subtotal)}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatCurrency(receiptSale.total_amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="capitalize">{receiptSale.payment_method}</span></div>
              {receiptSale.change_amount && <div className="flex justify-between text-green-600"><span>Change</span><span>{formatCurrency(receiptSale.change_amount)}</span></div>}
            </div>
            <button onClick={() => setReceiptSale(null)} className="w-full mt-4 border rounded-lg py-2 text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
