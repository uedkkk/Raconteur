<script setup lang="ts">
import type { FieldDescriptor } from '~~/shared/types/settings'

definePageMeta({ layout: 'dashboard' })

const toast = useToast()

const namespaces = [
  { label: 'Site', value: 'app' },
  { label: 'System', value: 'system' },
  { label: 'Privacy', value: 'privacy' },
  { label: 'Location', value: 'location' },
]

const activeNamespace = ref('app')
const fields = ref<FieldDescriptor[]>([])
const loading = ref(false)
const saving = ref(false)
const formValues = ref<Record<string, any>>({})

async function fetchFields() {
  loading.value = true
  try {
    const res = await $fetch<{ fields: FieldDescriptor[] }>(
      '/api/system/settings/fields',
      { query: { namespace: activeNamespace.value } },
    )
    fields.value = res.fields
    const defaults: Record<string, any> = {}
    res.fields.forEach((f) => {
      defaults[f.key] = f.value ?? f.defaultValue ?? ''
    })
    formValues.value = defaults
  } catch (e) {
    console.error('Failed to load settings:', e)
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const updates = fields.value.map((f) => ({
      namespace: activeNamespace.value,
      key: f.key,
      value: formValues.value[f.key],
    }))

    await $fetch('/api/system/settings/batch', {
      method: 'PUT',
      body: { updates },
    })

    toast.add({ title: 'Settings saved', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Failed to save', description: e.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

function isFieldVisible(field: FieldDescriptor) {
  if (!field.ui?.visibleIf) return true
  return formValues.value[field.ui.visibleIf.fieldKey] === field.ui.visibleIf.value
}

watch(activeNamespace, fetchFields, { immediate: true })
</script>

<template>
  <div class="p-8 max-w-3xl">
    <h1 class="font-display text-2xl font-bold text-neutral-900 mb-6">Settings</h1>

    <div class="flex gap-1 mb-6 border-b border-neutral-200">
      <button
        v-for="ns in namespaces"
        :key="ns.value"
        @click="activeNamespace = ns.value"
        class="px-4 py-2 font-sans text-sm transition-colors border-b-2 -mb-px"
        :class="activeNamespace === ns.value
          ? 'border-brand-500 text-brand-700 font-medium'
          : 'border-transparent text-neutral-500 hover:text-neutral-900'"
      >
        {{ ns.label }}
      </button>
    </div>

    <div v-if="loading" class="py-20 text-center">
      <UIcon name="i-lucide-loader-2" class="text-2xl text-neutral-400 animate-spin" />
    </div>

    <div v-else class="space-y-5">
      <template v-for="field in fields" :key="field.key">
        <div v-if="isFieldVisible(field)">
          <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">
            {{ field.key }}
            <span v-if="field.ui?.required" class="text-red-400">*</span>
          </label>

          <input
            v-if="field.ui.type === 'input' || field.ui.type === 'url'"
            v-model="formValues[field.key]"
            :type="field.ui.type === 'url' ? 'url' : 'text'"
            :placeholder="field.ui?.placeholder"
            class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />

          <input
            v-else-if="field.ui.type === 'password'"
            v-model="formValues[field.key]"
            type="password"
            :placeholder="field.ui?.placeholder"
            class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />

          <input
            v-else-if="field.ui.type === 'number'"
            v-model.number="formValues[field.key]"
            type="number"
            :min="field.ui?.min"
            :max="field.ui?.max"
            class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
          />

          <select
            v-else-if="field.ui.type === 'select'"
            v-model="formValues[field.key]"
            class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white"
          >
            <option v-for="opt in field.ui?.options" :key="String(opt.value)" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <div v-else-if="field.ui.type === 'toggle'" class="flex items-center">
            <button
              @click="formValues[field.key] = !formValues[field.key]"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="formValues[field.key] ? 'bg-brand-500' : 'bg-neutral-300'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="formValues[field.key] ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>

          <textarea
            v-else-if="field.ui.type === 'textarea'"
            v-model="formValues[field.key]"
            :placeholder="field.ui?.placeholder"
            rows="3"
            class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-y"
          />

          <p v-if="field.ui?.help" class="font-sans text-xs text-neutral-400 mt-1">{{ field.ui.help }}</p>
        </div>
      </template>

      <div class="pt-4">
        <button
          @click="save"
          :disabled="saving"
          class="px-5 py-2 font-sans font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>
