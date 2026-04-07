export type UserRole = 'admin' | 'manager' | 'cashier'

export interface User {
  id: number
  username: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export interface Category {
  id: number
  name: string
  is_active: boolean
  created_at: string
}

export interface Product {
  id: number
  name: string
  sku: string | null
  barcode: string | null
  category: number | null
  category_name: string | null
  selling_price: string
  cost_price: string | null
  stock_quantity: number
  low_stock_threshold: number
  image: string | null
  is_active: boolean
  is_low_stock: boolean
  created_at: string
  updated_at?: string
}

export interface InventoryMovement {
  id: number
  product: number
  product_name: string
  movement_type: 'stock_in' | 'stock_out' | 'adjustment' | 'sale_deduction' | 'refund_return'
  quantity: number
  reference_type: string | null
  reference_id: number | null
  notes: string | null
  created_by: number | null
  created_by_name: string | null
  created_at: string
}

export interface SaleItem {
  id: number
  product: number
  product_name_snapshot: string
  unit_price: string
  quantity: number
  line_discount: string
  line_total: string
}

export type SaleStatus = 'completed' | 'voided' | 'refunded' | 'held'
export type PaymentMethod = 'cash' | 'gcash' | 'card' | 'bank_transfer' | 'other'

export interface Sale {
  id: number
  receipt_number: string
  cashier: number
  cashier_name: string
  subtotal: string
  discount_amount: string
  tax_amount: string
  total_amount: string
  payment_method: PaymentMethod
  cash_received: string | null
  change_amount: string | null
  status: SaleStatus
  notes: string | null
  items?: SaleItem[]
  item_count?: number
  voided_by: number | null
  voided_at: string | null
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
  line_discount: number
}

export interface Store {
  id?: number
  store_name: string
  address: string | null
  contact_number: string | null
  tax_rate: string
  currency: string
  receipt_header: string | null
  receipt_footer: string | null
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface SalesSummary {
  total_revenue: string
  total_transactions: number
  total_discount: string
  total_tax: string
  avg_transaction_value: string
  voided_transactions: number
}
