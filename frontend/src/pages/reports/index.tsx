import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/entities/report/api/reportsApi'
import { formatCurrency, formatShortDate } from '@/shared/lib/utils'

type ReportTab = 'summary' | 'trend' | 'top-products' | 'by-cashier' | 'by-payment' | 'low-stock'

export function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('summary')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const params = {
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  }

  const { data: summary } = useQuery({
    queryKey: ['report-summary', params],
    queryFn: () => reportsApi.getSalesSummary(params),
    enabled: tab === 'summary',
  })

  const { data: trend } = useQuery({
    queryKey: ['report-trend', params],
    queryFn: () => reportsApi.getSalesTrend(params),
    enabled: tab === 'trend',
  })

  const { data: topProducts } = useQuery({
    queryKey: ['report-top-products', params],
    queryFn: () => reportsApi.getTopProducts(params),
    enabled: tab === 'top-products',
  })

  const { data: byCashier } = useQuery({
    queryKey: ['report-by-cashier', params],
    queryFn: () => reportsApi.getByCashier(params),
    enabled: tab === 'by-cashier',
  })

  const { data: byPayment } = useQuery({
    queryKey: ['report-by-payment', params],
    queryFn: () => reportsApi.getByPaymentMethod(params),
    enabled: tab === 'by-payment',
  })

  const { data: lowStock } = useQuery({
    queryKey: ['report-low-stock'],
    queryFn: reportsApi.getLowStock,
    enabled: tab === 'low-stock',
  })

  const tabs: { value: ReportTab; label: string }[] = [
    { value: 'summary', label: 'Summary' },
    { value: 'trend', label: 'Sales Trend' },
    { value: 'top-products', label: 'Top Products' },
    { value: 'by-cashier', label: 'By Cashier' },
    { value: 'by-payment', label: 'By Payment' },
    { value: 'low-stock', label: 'Low Stock' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      {/* Date filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }} className="border rounded-lg px-3 py-2 text-sm text-destructive">
            Clear
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary */}
      {tab === 'summary' && summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: formatCurrency(summary.total_revenue || '0') },
            { label: 'Transactions', value: summary.total_transactions },
            { label: 'Avg Transaction', value: formatCurrency(summary.avg_transaction_value || '0') },
            { label: 'Total Discount', value: formatCurrency(summary.total_discount || '0') },
            { label: 'Total Tax', value: formatCurrency(summary.total_tax || '0') },
            { label: 'Voided', value: summary.voided_transactions },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Trend */}
      {tab === 'trend' && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Transactions</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(trend as any[])?.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-secondary/50">
                  <td className="px-4 py-3">{formatShortDate(row.period)}</td>
                  <td className="px-4 py-3 text-right">{row.count}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(row.total || '0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Top Products */}
      {tab === 'top-products' && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-right px-4 py-3">Qty Sold</th>
                <th className="text-right px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(topProducts as any[])?.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium">{row.product_name_snapshot}</td>
                  <td className="px-4 py-3 text-right">{row.total_qty}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(row.total_revenue || '0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* By Cashier */}
      {tab === 'by-cashier' && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3">Cashier</th>
                <th className="text-right px-4 py-3">Transactions</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(byCashier as any[])?.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium">{row.cashier__full_name}</td>
                  <td className="px-4 py-3 text-right">{row.num_transactions}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(row.total_sales || '0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* By Payment */}
      {tab === 'by-payment' && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3">Method</th>
                <th className="text-right px-4 py-3">Transactions</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(byPayment as any[])?.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium capitalize">{row.payment_method}</td>
                  <td className="px-4 py-3 text-right">{row.count}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(row.total || '0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Low Stock */}
      {tab === 'low-stock' && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-right px-4 py-3">Stock</th>
                <th className="text-right px-4 py-3">Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(lowStock as any[])?.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.sku || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.category__name || '-'}</td>
                  <td className="px-4 py-3 text-right font-bold text-yellow-600">{row.stock_quantity}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{row.low_stock_threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
