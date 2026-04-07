import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/entities/product/api/productsApi'
import { categoriesApi } from '@/entities/category/api/categoriesApi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Product } from '@/shared/types'
import { Plus, Pencil, Archive } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().optional(),
  selling_price: z.string().min(1, 'Selling price is required'),
  cost_price: z.string().optional(),
  stock_quantity: z.string().default('0'),
  low_stock_threshold: z.string().default('10'),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

export function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const qc = useQueryClient()

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => productsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setShowForm(false); reset() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => productsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setEditing(null); setShowForm(false); reset() },
  })

  const archiveMutation = useMutation({
    mutationFn: productsApi.archive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })

  const onSubmit = (values: FormValues) => {
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => v !== undefined && fd.append(k, String(v)))
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: values as any })
    } else {
      createMutation.mutate(fd)
    }
  }

  const products = productsData?.results ?? []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => { setEditing(null); reset(); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-4">{editing ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <input {...register('name')} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">SKU</label>
              <input {...register('sku')} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Selling Price *</label>
              <input {...register('selling_price')} type="number" step="0.01" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
              {errors.selling_price && <p className="text-destructive text-xs mt-1">{errors.selling_price.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Cost Price</label>
              <input {...register('cost_price')} type="number" step="0.01" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select {...register('category')} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm">
                <option value="">No category</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Stock Quantity</label>
              <input {...register('stock_quantity')} type="number" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Low Stock Threshold</label>
              <input {...register('low_stock_threshold')} type="number" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input {...register('is_active')} type="checkbox" id="is_active" />
              <label htmlFor="is_active" className="text-sm">Active</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium">
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset() }} className="border rounded-lg px-4 py-2 text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">Stock</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.sku || '-'}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.category_name || '-'}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(p.selling_price)}</td>
                <td className={`px-4 py-3 text-right font-medium ${p.is_low_stock ? 'text-yellow-600' : ''}`}>
                  {p.stock_quantity}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-secondary text-muted-foreground'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <button onClick={() => { setEditing(p); reset({ name: p.name, sku: p.sku ?? '', selling_price: p.selling_price, cost_price: p.cost_price ?? '', stock_quantity: String(p.stock_quantity), low_stock_threshold: String(p.low_stock_threshold), is_active: p.is_active, category: p.category ? String(p.category) : '' }); setShowForm(true) }} className="p-1.5 hover:bg-secondary rounded-lg">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => archiveMutation.mutate(p.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg">
                    <Archive size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
