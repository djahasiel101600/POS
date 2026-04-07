import { apiClient } from '@/shared/api/client'

export const inventoryApi = {
  getMovements: async (params?: Record<string, string>) => {
    const { data } = await apiClient.get('/inventory/movements/', { params })
    return data
  },
  stockIn: async (product_id: number, quantity: number, notes?: string) => {
    const { data } = await apiClient.post('/inventory/stock-in/', { product_id, quantity, notes })
    return data
  },
  adjustment: async (product_id: number, quantity: number, notes: string) => {
    const { data } = await apiClient.post('/inventory/adjustment/', { product_id, quantity, notes })
    return data
  },
  getLowStock: async () => {
    const { data } = await apiClient.get('/inventory/low-stock/')
    return data
  },
}
