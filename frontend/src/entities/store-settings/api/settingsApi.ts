import { apiClient } from '@/shared/api/client'
import type { Store } from '@/shared/types'

export const settingsApi = {
  getStore: async (): Promise<Store> => {
    const { data } = await apiClient.get<Store>('/settings/store/')
    return data
  },
  updateStore: async (payload: Partial<Store>): Promise<Store> => {
    const { data } = await apiClient.patch<Store>('/settings/store/', payload)
    return data
  },
}
