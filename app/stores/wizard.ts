import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useWizardStore = defineStore('wizard', () => {
  const admin = ref(useLocalStorage<Record<string, any>>('wizard-admin', {}))
  const site = ref(useLocalStorage<Record<string, any>>('wizard-site', {}))
  const storage = ref(useLocalStorage<Record<string, any>>('wizard-storage', {}))

  const updateAdmin = (data: Record<string, any>) => {
    admin.value = { ...admin.value, ...data }
  }

  const updateSite = (data: Record<string, any>) => {
    site.value = { ...site.value, ...data }
  }

  const updateStorage = (data: Record<string, any>) => {
    storage.value = { ...storage.value, ...data }
  }

  const clear = () => {
    admin.value = {}
    site.value = {}
    storage.value = {}
  }

  return {
    admin,
    site,
    storage,
    updateAdmin,
    updateSite,
    updateStorage,
    clear,
  }
})
