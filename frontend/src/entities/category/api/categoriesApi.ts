import { apiClient } from '@/shared/api/client'
import type { Category } from '@/shared/types'

export const categoriesApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Category[]>('/categories/')
    return data
  },
  create: async (name: string) => {
    const { data } = await apiClient.post<Category>('/categories/', { name })
    return data
  },
  update: async (id: number, payload: Partial<Category>) => {
    const { data } = await apiClient.patch<Category>(`/categories/${id}/`, payload)
    return data
  },
}
