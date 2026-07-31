import type { FieldDescriptor, SettingsFieldsResponse } from '~~/shared/types/settings'
import { useWizardStore } from '~/stores/wizard'

export function useWizardForm(namespace: string) {
  const toast = useToast()
  const fields = ref<FieldDescriptor[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const store = useWizardStore()

  const state = computed({
    get: () => {
      switch (namespace) {
        case 'admin':
          return store.admin
        case 'app':
          return store.site
        case 'storage':
          return store.storage
        default:
          return {}
      }
    },
    set: (val) => {
      switch (namespace) {
        case 'admin':
          store.updateAdmin(val)
          break
        case 'app':
          store.updateSite(val)
          break
        case 'storage':
          store.updateStorage(val)
          break
      }
    },
  })

  const fetchSchema = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<SettingsFieldsResponse>(
        '/api/wizard/schema',
        { query: { namespace } },
      )
      fields.value = response.fields

      const defaults: Record<string, any> = {}
      response.fields.forEach((field) => {
        defaults[field.key] = field.value ?? field.defaultValue ?? ''
      })

      const currentState = state.value
      state.value = { ...defaults, ...currentState }
    } catch (e: any) {
      error.value = e.message
      toast.add({
        title: 'Failed to load form',
        description: e.message,
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  const isFieldVisible = (field: FieldDescriptor) => {
    if (!field.ui?.visibleIf) return true
    const { fieldKey, value } = field.ui.visibleIf
    return state.value[fieldKey] === value
  }

  const getField = (key: string) => fields.value.find((f) => f.key === key)

  onMounted(() => {
    fetchSchema()
  })

  return { fields, state, loading, error, isFieldVisible, fetchSchema, getField }
}
