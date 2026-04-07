import { apiClient } from '@/shared/api/client'

export const reportsApi = {
  getSalesSummary: async (params?: Record<string, string>) => {
    const { data } = await apiClient.get('/reports/sales-summary/', { params })
    return data
  },
  getSalesTrend: async (params?: Record<string, string>) => {
    const { data } = await apiClient.get('/reports/sales-trend/', { params })
    return data
  },
  getTopProducts: async (params?: Record<string, string>) => {
    const { data } = await apiClient.get('/reports/top-products/', { params })
    return data
  },
  getByCashier: async (params?: Record<string, string>) => {
    const { data } = await apiClient.get('/reports/by-cashier/', { params })
    return data
  },
  getByPaymentMethod: async (params?: Record<string, string>) => {
    const { data } = await apiClient.get('/reports/by-payment-method/', { params })
    return data
  },
  getLowStock: async () => {
    const { data } = await apiClient.get('/reports/low-stock/')
    return data
  },
  getInventoryMovements: async (params?: Record<string, string>) => {
    const { data } = await apiClient.get('/reports/inventory-movements/', { params })
    return data
  },
}
