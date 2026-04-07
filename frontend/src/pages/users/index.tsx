import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/entities/user/api/usersApi'
import type { User, UserRole } from '@/shared/types'
import { Plus, Pencil, KeyRound } from 'lucide-react'

export function UsersPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<{ username: string; full_name: string; role: UserRole; password: string; is_active: boolean }>({ username: '', full_name: '', role: 'cashier' as UserRole, password: '', is_active: true })
  const [resetPwd, setResetPwd] = useState<{ userId: number; password: string } | null>(null)
  const qc = useQueryClient()

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll() })

  const createMutation = useMutation({
    mutationFn: () => usersApi.create({ username: form.username, full_name: form.full_name, role: form.role, password: form.password }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowForm(false) },
  })

  const updateMutation = useMutation({
    mutationFn: () => usersApi.update(editing!.id, { full_name: form.full_name, role: form.role, is_active: form.is_active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setEditing(null); setShowForm(false) },
  })

  const resetMutation = useMutation({
    mutationFn: () => usersApi.resetPassword(resetPwd!.userId, resetPwd!.password),
    onSuccess: () => setResetPwd(null),
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => { setEditing(null); setForm({ username: '', full_name: '', role: 'cashier' as UserRole, password: '', is_active: true }); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {(showForm || editing) && (
        <div className="bg-card border rounded-xl p-6 mb-6 max-w-md">
          <h2 className="font-semibold mb-4">{editing ? 'Edit User' : 'New User'}</h2>
          <div className="space-y-3">
            {!editing && (
              <div>
                <label className="text-sm font-medium">Username *</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm">
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {!editing && (
              <div>
                <label className="text-sm font-medium">Password *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
            {editing && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ua" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <label htmlFor="ua" className="text-sm">Active</label>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium">
                {editing ? 'Update' : 'Create'}
              </button>
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="border rounded-lg px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password reset modal */}
      {resetPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="font-semibold mb-4">Reset Password</h2>
            <input type="password" value={resetPwd.password} onChange={(e) => setResetPwd({ ...resetPwd, password: e.target.value })} placeholder="New password" className="w-full border rounded-lg px-3 py-2 text-sm mb-4" />
            <div className="flex gap-3">
              <button onClick={() => resetMutation.mutate()} className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium">Reset</button>
              <button onClick={() => setResetPwd(null)} className="border rounded-lg px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Username</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : users?.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium">{u.full_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.username}</td>
                <td className="px-4 py-3"><span className="capitalize px-2 py-0.5 rounded-full text-xs font-medium bg-secondary">{u.role}</span></td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-secondary text-muted-foreground'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <button onClick={() => { setEditing(u); setForm({ username: u.username, full_name: u.full_name, role: u.role, password: '', is_active: u.is_active }); setShowForm(true) }} className="p-1.5 hover:bg-secondary rounded-lg"><Pencil size={14} /></button>
                  <button onClick={() => setResetPwd({ userId: u.id, password: '' })} className="p-1.5 hover:bg-secondary rounded-lg"><KeyRound size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
