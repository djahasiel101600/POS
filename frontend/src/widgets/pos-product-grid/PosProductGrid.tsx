import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { categoriesApi } from '@/entities/category/api/categoriesApi'
import { productsApi } from '@/entities/product/api/productsApi'
import { useCartStore } from '@/app/store/cartStore'
import type { Product } from '@/shared/types'
import { cn } from '@/shared/lib/utils'
import { Search } from 'lucide-react'

export function PosProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const addItem = useCartStore((s) => s.addItem)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { category: selectedCategory, search }],
    queryFn: () =>
      productsApi.getAll({
        is_active: 'true',
        ...(selectedCategory ? { category: String(selectedCategory) } : {}),
        ...(search ? { search } : {}),
      }),
  })

  const products = productsData?.results ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, SKU or barcode..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-3 py-2 border-b overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
            !selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          )}
        >
          All
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addItem} />
            ))}
          </div>
        )}
        {!isLoading && products.length === 0 && (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No products found.
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const outOfStock = product.stock_quantity === 0

  return (
    <button
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      className={cn(
        'relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all active:scale-95',
        outOfStock
          ? 'opacity-50 cursor-not-allowed bg-muted'
          : 'bg-card hover:border-primary hover:shadow-md cursor-pointer'
      )}
    >
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-16 h-16 object-cover rounded-lg mb-2"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center mb-2">
          <Package size={28} className="text-muted-foreground" />
        </div>
      )}
      <p className="text-sm font-semibold leading-tight line-clamp-2">{product.name}</p>
      <p className="text-sm text-primary font-bold mt-1">
        ₱{parseFloat(product.selling_price).toFixed(2)}
      </p>
      {product.is_low_stock && !outOfStock && (
        <span className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-800 rounded-full px-1.5 py-0.5">
          Low
        </span>
      )}
      {outOfStock && (
        <span className="absolute top-2 right-2 text-xs bg-destructive/10 text-destructive rounded-full px-1.5 py-0.5">
          Out
        </span>
      )}
    </button>
  )
}

// Need to import Package here since it's used in ProductCard
import { Package } from 'lucide-react'
