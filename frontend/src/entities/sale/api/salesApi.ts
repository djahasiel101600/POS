import { apiClient } from '@/shared/api/client'
import type { Sale, PaginatedResponse } from '@/shared/types'

interface CreateSalePayload {
  items: { product_id: number; quantity: number; line_discount?: number }[]
  payment_method: string
  cash_received?: number
  discount_amount?: number
  notes?: string
  reference_number?: string
}

export const salesApi = {
  getAll: async (params?: Record<string, string>) => {
    const { data } = await apiClient.get<PaginatedResponse<Sale>>('/sales/', { params })
    return data
  },
  getById: async (id: number) => {
    const { data } = await apiClient.get<Sale>(`/sales/${id}/`)
    return data
  },
  create: async (payload: CreateSalePayload) => {
    const { data } = await apiClient.post<Sale>('/sales/', payload)
    return data
  },
  void: async (id: number) => {
    const { data } = await apiClient.post<Sale>(`/sales/${id}/void/`)
    return data
  },
  getReceipt: async (id: number) => {
    const { data } = await apiClient.get(`/sales/${id}/receipt/`)
    return data
  },
}
