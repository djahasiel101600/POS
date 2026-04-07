import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PosProductGrid } from '@/widgets/pos-product-grid/PosProductGrid'
import { PosCart } from '@/widgets/pos-cart/PosCart'
import { CheckoutModal } from '@/features/create-sale/ui/CheckoutModal'
import { settingsApi } from '@/entities/store-settings/api/settingsApi'
import type { Sale } from '@/shared/types'

export function PosPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [lastSale, setLastSale] = useState<Sale | null>(null)

  const { data: store } = useQuery({
    queryKey: ['store-settings'],
    queryFn: settingsApi.getStore,
    staleTime: 1000 * 60 * 10,
  })

  const taxRate = store ? parseFloat(store.tax_rate) : 0

  const handleSuccess = (sale: Sale) => {
    setLastSale(sale)
    setCheckoutOpen(false)
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Product grid */}
      <div className="flex-1 min-w-0 flex flex-col">
        <PosProductGrid />
      </div>

      {/* Right: Cart panel */}
      <div className="w-80 xl:w-96 shrink-0 flex flex-col">
        <PosCart onCheckout={() => setCheckoutOpen(true)} taxRate={taxRate} />
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleSuccess}
        taxRate={taxRate}
      />
    </div>
  )
}
