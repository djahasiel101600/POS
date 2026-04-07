import { apiClient } from '@/shared/api/client'
import type { Product, PaginatedResponse } from '@/shared/types'

export const productsApi = {
  getAll: async (params?: Record<string, string>) => {
    const { data } = await apiClient.get<PaginatedResponse<Product>>('/products/', { params })
    return data
  },
  getById: async (id: number) => {
    const { data } = await apiClient.get<Product>(`/products/${id}/`)
    return data
  },
  create: async (payload: FormData) => {
    const { data } = await apiClient.post<Product>('/products/', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  update: async (id: number, payload: Partial<Product> | FormData) => {
    const { data } = await apiClient.patch<Product>(`/products/${id}/`, payload)
    return data
  },
  archive: async (id: number) => {
    await apiClient.delete(`/products/${id}/`)
  },
}
