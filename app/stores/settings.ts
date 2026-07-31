import { defineStore } from 'pinia'

type SettingValue = string | number | boolean | null | Record<string, any>

interface SettingsState {
  data: Record<string, Record<string, SettingValue>>
  isInitialized: boolean
  isLoading: boolean
  error: Error | null
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    data: {},
    isInitialized: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    isReady: (state) => state.isInitialized && !state.isLoading,
    getError: (state) => state.error,
  },

  actions: {
    async initSettings(): Promise<void> {
      if (this.isInitialized) {
        return
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await $fetch<{
          timestamp: number
          data: Record<string, Record<string, SettingValue>>
        }>('/api/system/settings/all')

        this.data = response.data
        this.isInitialized = true
      } catch (error) {
        this.error = error as Error
        console.error('[Settings] Failed to initialize settings:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    getSetting(key: string): SettingValue {
      if (!this.isInitialized) {
        console.warn(
          '[Settings] Settings not initialized yet. Call await initSettings() first.',
        )
        return null
      }

      if (key.includes(':')) {
        const parts = key.split(':')
        const namespace = parts[0]
        const settingKey = parts[1]
        if (namespace && settingKey) {
          const namespaceObj = this.data[namespace]
          if (namespaceObj) {
            return (namespaceObj as any)[settingKey] ?? null
          }
        }
        return null
      }

      return this.data[key] ?? null
    },

    async refreshSettings(): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const response = await $fetch<{
          timestamp: number
          data: Record<string, Record<string, SettingValue>>
        }>('/api/system/settings/all')

        this.data = response.data
        this.isInitialized = true
      } catch (error) {
        this.error = error as Error
        console.error('[Settings] Failed to refresh settings:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})

export function getSetting(key: string): SettingValue {
  const store = useSettingsStore()
  return store.getSetting(key)
}

export function useSettingRef(key: string) {
  const store = useSettingsStore()
  return computed(() => store.getSetting(key))
}

export function isSettingsReady(): boolean {
  const store = useSettingsStore()
  return store.isReady
}

export async function refreshSettings(): Promise<void> {
  const store = useSettingsStore()
  await store.refreshSettings()
}
