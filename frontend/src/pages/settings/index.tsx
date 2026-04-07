import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/entities/store-settings/api/settingsApi'
import { useState, useEffect } from 'react'
import type { Store } from '@/shared/types'

export function SettingsPage() {
  const qc = useQueryClient()
  const { data: store } = useQuery({ queryKey: ['store-settings'], queryFn: settingsApi.getStore })
  const [form, setForm] = useState<Partial<Store>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (store) setForm(store)
  }, [store])

  const mutation = useMutation({
    mutationFn: () => settingsApi.updateStore(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['store-settings'] }); setSaved(true); setTimeout(() => setSaved(false), 2000) },
  })

  const field = (key: keyof Store, label: string, type = 'text', isTextarea = false) => (
    <div key={key}>
      <label className="text-sm font-medium">{label}</label>
      {isTextarea ? (
        <textarea
          value={(form[key] as string) || ''}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={(form[key] as string) || ''}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
        />
      )}
    </div>
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-card border rounded-xl p-6 max-w-lg">
        <h2 className="font-semibold mb-4">Store Profile</h2>
        <div className="space-y-4">
          {field('store_name', 'Store Name *')}
          {field('address', 'Address', 'text', true)}
          {field('contact_number', 'Contact Number')}
          {field('tax_rate', 'Tax Rate (%)', 'number')}
          {field('currency', 'Currency')}
          {field('receipt_header', 'Receipt Header', 'text', true)}
          {field('receipt_footer', 'Receipt Footer', 'text', true)}
          {saved && <p className="text-sm text-green-600">Settings saved.</p>}
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
