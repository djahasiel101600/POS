import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '@/entities/category/api/categoriesApi'
import type { Category } from '@/shared/types'
import { Plus, Pencil } from 'lucide-react'

export function CategoriesPage() {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)
  const qc = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: () => categoriesApi.create(name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setShowForm(false); setName('') },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Category>) => categoriesApi.update(editing!.id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setEditing(null); setName('') },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) updateMutation.mutate({ name, is_active: editing.is_active })
    else createMutation.mutate()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => { setEditing(null); setName(''); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {(showForm || editing) && (
        <div className="bg-card border rounded-xl p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              autoFocus
            />
            <button type="submit" className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium">
              {editing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setName('') }} className="border rounded-lg px-4 py-2 text-sm">
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : categories?.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-secondary text-muted-foreground'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { setEditing(c); setName(c.name); setShowForm(true) }}
                    className="p-1.5 hover:bg-secondary rounded-lg"
                  >
                    <Pencil size={14} />
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
