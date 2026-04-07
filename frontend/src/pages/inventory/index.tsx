import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/entities/inventory-movement/api/inventoryApi'
import { productsApi } from '@/entities/product/api/productsApi'
import { formatDate } from '@/shared/lib/utils'

export function InventoryPage() {
  const [tab, setTab] = useState<'movements' | 'stock-in' | 'adjustment'>('movements')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')
  const qc = useQueryClient()

  const { data: movements, isLoading } = useQuery({
    queryKey: ['inventory-movements'],
    queryFn: () => inventoryApi.getMovements(),
  })

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll({ is_active: 'true' }),
  })

  const stockInMutation = useMutation({
    mutationFn: () => inventoryApi.stockIn(parseInt(productId), parseInt(quantity), notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-movements'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      setProductId(''); setQuantity(''); setNotes('')
      setMessage('Stock added successfully.')
    },
  })

  const adjustMutation = useMutation({
    mutationFn: () => inventoryApi.adjustment(parseInt(productId), parseInt(quantity), notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-movements'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      setProductId(''); setQuantity(''); setNotes('')
      setMessage('Stock adjusted successfully.')
    },
    onError: (err: any) => setMessage(err?.response?.data?.detail || 'Error'),
  })

  const products = productsData?.results ?? []
  const movementsList = Array.isArray(movements) ? movements : (movements as any)?.results ?? []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['movements', 'stock-in', 'adjustment'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setMessage('') }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            {t === 'movements' ? 'Movement History' : t === 'stock-in' ? 'Stock In' : 'Adjustment'}
          </button>
        ))}
      </div>

      {tab === 'movements' && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">Qty</th>
                <th className="text-left px-4 py-3">Notes</th>
                <th className="text-left px-4 py-3">By</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : movementsList.map((m: any) => (
                <tr key={m.id} className="hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium">{m.product_name}</td>
                  <td className="px-4 py-3"><span className="capitalize text-xs bg-secondary px-2 py-0.5 rounded-full">{m.movement_type.replace('_', ' ')}</span></td>
                  <td className={`px-4 py-3 text-right font-semibold ${m.quantity < 0 ? 'text-destructive' : 'text-green-600'}`}>{m.quantity > 0 ? '+' : ''}{m.quantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.notes || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.created_by_name || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(tab === 'stock-in' || tab === 'adjustment') && (
        <div className="bg-card border rounded-xl p-6 max-w-md">
          <h2 className="font-semibold mb-4">{tab === 'stock-in' ? 'Add Stock' : 'Adjust Stock'}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Product</label>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm">
                <option value="">Select product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Quantity {tab === 'adjustment' ? '(negative to decrease)' : ''}</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Notes {tab === 'adjustment' ? '*' : ''}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" rows={3} />
            </div>
            {message && <p className="text-sm text-green-600">{message}</p>}
            <button
              onClick={() => tab === 'stock-in' ? stockInMutation.mutate() : adjustMutation.mutate()}
              disabled={!productId || !quantity || (tab === 'adjustment' && !notes)}
              className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {tab === 'stock-in' ? 'Add Stock' : 'Apply Adjustment'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
