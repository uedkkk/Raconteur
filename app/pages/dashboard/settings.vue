<script setup lang="ts">
import type { FieldDescriptor } from '~~/shared/types/settings'

definePageMeta({ layout: 'dashboard' })

const toast = useToast()

const namespaces = [
  { label: 'Site', value: 'app' },
  { label: 'System', value: 'system' },
  { label: 'Storage', value: 'storage' },
  { label: 'Privacy', value: 'privacy' },
  { label: 'Location', value: 'location' },
  { label: 'Last.fm', value: 'lastfm' },
]

const activeNamespace = ref('app')
const fields = ref<FieldDescriptor[]>([])
const loading = ref(false)
const saving = ref(false)
const formValues = ref<Record<string, any>>({})

// Storage state
interface StorageProvider {
  id: number
  name: string
  provider: string
  isActive: boolean
  createdAt: string
  config?: any
}
const storageProviders = ref<StorageProvider[]>([])
const storageLoading = ref(false)
const showAddProvider = ref(false)
const newProvider = ref({
  name: '',
  provider: 's3' as 's3' | 'local',
  endpoint: '',
  bucket: '',
  region: 'auto',
  accessKeyId: '',
  secretAccessKey: '',
  forcePathStyle: false,
})
const addingProvider = ref(false)

const editingProviderId = ref<number | null>(null)
const editProvider = ref({
  name: '',
  endpoint: '',
  bucket: '',
  region: 'auto',
  accessKeyId: '',
  secretAccessKey: '',
  forcePathStyle: false,
})
const savingProvider = ref(false)

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

const testing = ref(false)
const testResult = ref<{ ok: boolean; message: string } | null>(null)

async function testLastfm() {
  testing.value = true
  testResult.value = null
  try {
    const res = await $fetch<{ ok: boolean; sample: string | null }>(
      '/api/lastfm/test',
      {
        method: 'POST',
        body: {
          apiKey: formValues.value['apiKey'],
          user: formValues.value['user'],
        },
      },
    )
    testResult.value = {
      ok: true,
      message: res.sample ? `Connected — top track: ${res.sample}` : 'Connected',
    }
  } catch (e: any) {
    testResult.value = {
      ok: false,
      message: e?.statusMessage || e?.message || 'Failed',
    }
  } finally {
    testing.value = false
  }
}

// Storage functions
async function fetchStorageProviders() {
  storageLoading.value = true
  try {
    const res = await $fetch<{ providers: StorageProvider[]; activeId: number }>(
      '/api/system/settings/storage-providers',
    )
    storageProviders.value = res.providers
  } catch (e) {
    console.error('Failed to load storage providers:', e)
  } finally {
    storageLoading.value = false
  }
}

async function activateProvider(id: number) {
  try {
    await $fetch(`/api/system/settings/storage-providers/${id}/activate`, { method: 'POST' })
    await fetchStorageProviders()
    toast.add({ title: 'Storage provider switched', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Failed to switch provider', description: e.message, color: 'error' })
  }
}

async function deleteProvider(id: number) {
  if (!confirm('Delete this storage provider?')) return
  try {
    await $fetch(`/api/system/settings/storage-providers/${id}`, { method: 'DELETE' })
    await fetchStorageProviders()
    toast.add({ title: 'Provider deleted', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Failed to delete', description: e.message, color: 'error' })
  }
}

async function addProvider() {
  addingProvider.value = true
  try {
    await $fetch('/api/system/settings/storage-providers', {
      method: 'POST',
      body: {
        name: newProvider.value.name,
        config: {
          provider: 's3',
          endpoint: newProvider.value.endpoint,
          bucket: newProvider.value.bucket,
          region: newProvider.value.region,
          accessKeyId: newProvider.value.accessKeyId,
          secretAccessKey: newProvider.value.secretAccessKey,
          forcePathStyle: newProvider.value.forcePathStyle,
        },
      },
    })
    showAddProvider.value = false
    newProvider.value = {
      name: '', provider: 's3', endpoint: '', bucket: '', region: 'auto',
      accessKeyId: '', secretAccessKey: '', forcePathStyle: false,
    }
    await fetchStorageProviders()
    toast.add({ title: 'Storage provider added', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Failed to add provider', description: e.message, color: 'error' })
  } finally {
    addingProvider.value = false
  }
}

function startEditProvider(p: StorageProvider) {
  editingProviderId.value = p.id
  const cfg = p.config || {}
  editProvider.value = {
    name: p.name,
    endpoint: cfg.endpoint || '',
    bucket: cfg.bucket || '',
    region: cfg.region || 'auto',
    accessKeyId: cfg.accessKeyId || '',
    secretAccessKey: '',
    forcePathStyle: cfg.forcePathStyle || false,
  }
}

function cancelEditProvider() {
  editingProviderId.value = null
}

async function saveEditProvider() {
  if (editingProviderId.value === null) return
  savingProvider.value = true
  try {
    await $fetch(`/api/system/settings/storage-providers/${editingProviderId.value}`, {
      method: 'PUT',
      body: {
        name: editProvider.value.name,
        config: {
          provider: 's3',
          endpoint: editProvider.value.endpoint,
          bucket: editProvider.value.bucket,
          region: editProvider.value.region,
          accessKeyId: editProvider.value.accessKeyId,
          secretAccessKey: editProvider.value.secretAccessKey,
          forcePathStyle: editProvider.value.forcePathStyle,
        },
      },
    })
    editingProviderId.value = null
    await fetchStorageProviders()
    toast.add({ title: 'Storage provider updated', color: 'success' })
  } catch (e: any) {
    toast.add({ title: 'Failed to update provider', description: e.message, color: 'error' })
  } finally {
    savingProvider.value = false
  }
}

watch(activeNamespace, (val) => {
  testResult.value = null
  if (val === 'storage') {
    fetchStorageProviders()
  } else {
    fetchFields()
  }
}, { immediate: true })
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

    <!-- Storage tab -->
    <div v-if="activeNamespace === 'storage'">
      <div v-if="storageLoading" class="py-20 text-center">
        <UIcon name="i-lucide-loader-2" class="text-2xl text-neutral-400 animate-spin" />
      </div>

      <div v-else>
        <!-- Provider list -->
        <div class="space-y-3 mb-6">
          <div
            v-for="p in storageProviders"
            :key="p.id"
            class="flex items-center justify-between p-4 border border-neutral-200 rounded"
          >
            <div class="flex items-center gap-3">
              <UIcon
                :name="p.provider === 's3' ? 'i-simple-icons-amazons3' : 'i-lucide-hard-drive'"
                class="text-xl text-neutral-400"
              />
              <div>
                <p class="font-sans text-sm font-medium text-neutral-900">{{ p.name }}</p>
                <p class="font-sans text-xs text-neutral-400 uppercase">{{ p.provider }}</p>
              </div>
              <span v-if="p.isActive" class="font-sans text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                Active
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="!p.isActive"
                @click="activateProvider(p.id)"
                class="px-3 py-1.5 font-sans text-xs font-medium text-brand-600 hover:bg-brand-50 rounded transition-colors"
              >
                Activate
              </button>
              <button
                v-if="!p.isActive"
                @click="startEditProvider(p)"
                class="p-1.5 text-neutral-400 hover:text-brand-500 transition-colors"
              >
                <UIcon name="i-lucide-pencil" class="text-base" />
              </button>
              <button
                v-if="!p.isActive"
                @click="deleteProvider(p.id)"
                class="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
              >
                <UIcon name="i-lucide-trash-2" class="text-base" />
              </button>
            </div>
          </div>

          <div v-if="storageProviders.length === 0" class="text-center py-12">
            <p class="font-sans text-sm text-neutral-400">No storage providers configured.</p>
          </div>
        </div>

        <!-- Edit provider form -->
        <div v-if="editingProviderId !== null" class="p-5 border border-neutral-200 rounded space-y-4 mb-6">
          <h3 class="font-sans text-sm font-medium text-neutral-900">Edit Storage Provider</h3>

          <div>
            <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Name</label>
            <input v-model="editProvider.name" type="text" placeholder="My S3"
              class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
          </div>
          <div>
            <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Endpoint</label>
            <input v-model="editProvider.endpoint" type="text" placeholder="https://s3.amazonaws.com"
              class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Bucket</label>
              <input v-model="editProvider.bucket" type="text" placeholder="my-bucket"
                class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
            </div>
            <div>
              <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Region</label>
              <input v-model="editProvider.region" type="text" placeholder="auto"
                class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Access Key ID</label>
              <input v-model="editProvider.accessKeyId" type="text"
                class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
            </div>
            <div>
              <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Secret Access Key</label>
              <input v-model="editProvider.secretAccessKey" type="password" placeholder="Leave empty to keep current"
                class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="editProvider.forcePathStyle = !editProvider.forcePathStyle"
              class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              :class="editProvider.forcePathStyle ? 'bg-brand-500' : 'bg-neutral-300'"
            >
              <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                :class="editProvider.forcePathStyle ? 'translate-x-5' : 'translate-x-1'" />
            </button>
            <span class="font-sans text-sm text-neutral-600">Force path style</span>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button
              @click="saveEditProvider"
              :disabled="savingProvider || !editProvider.name || !editProvider.endpoint || !editProvider.bucket"
              class="px-4 py-2 font-sans text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors disabled:opacity-50"
            >
              {{ savingProvider ? 'Saving...' : 'Save Changes' }}
            </button>
            <button
              @click="cancelEditProvider"
              class="px-4 py-2 font-sans text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Add provider -->
        <button
          v-if="!showAddProvider"
          @click="showAddProvider = true"
          class="flex items-center gap-1.5 px-4 py-2 font-sans text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors"
        >
          <UIcon name="i-lucide-plus" class="text-base" />
          Add S3 Provider
        </button>

        <div v-else class="p-5 border border-neutral-200 rounded space-y-4">
          <h3 class="font-sans text-sm font-medium text-neutral-900">New S3 Storage Provider</h3>

          <div>
            <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Name</label>
            <input v-model="newProvider.name" type="text" placeholder="My S3"
              class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
          </div>
          <div>
            <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Endpoint</label>
            <input v-model="newProvider.endpoint" type="text" placeholder="https://s3.amazonaws.com"
              class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Bucket</label>
              <input v-model="newProvider.bucket" type="text" placeholder="my-bucket"
                class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
            </div>
            <div>
              <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Region</label>
              <input v-model="newProvider.region" type="text" placeholder="auto"
                class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Access Key ID</label>
              <input v-model="newProvider.accessKeyId" type="text"
                class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
            </div>
            <div>
              <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Secret Access Key</label>
              <input v-model="newProvider.secretAccessKey" type="password"
                class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="newProvider.forcePathStyle = !newProvider.forcePathStyle"
              class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              :class="newProvider.forcePathStyle ? 'bg-brand-500' : 'bg-neutral-300'"
            >
              <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                :class="newProvider.forcePathStyle ? 'translate-x-5' : 'translate-x-1'" />
            </button>
            <span class="font-sans text-sm text-neutral-600">Force path style</span>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button
              @click="addProvider"
              :disabled="addingProvider || !newProvider.name || !newProvider.endpoint || !newProvider.bucket"
              class="px-4 py-2 font-sans text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors disabled:opacity-50"
            >
              {{ addingProvider ? 'Adding...' : 'Add Provider' }}
            </button>
            <button
              @click="showAddProvider = false"
              class="px-4 py-2 font-sans text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Generic settings tabs -->
    <div v-else-if="loading" class="py-20 text-center">
      <UIcon name="i-lucide-loader-2" class="text-2xl text-neutral-400 animate-spin" />
    </div>

    <div v-else class="space-y-5">
      <template v-for="field in fields" :key="field.key">
        <div v-if="isFieldVisible(field)">
          <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">
            {{ field.ui?.label || field.key }}
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

      <div class="pt-4 flex items-center gap-3 flex-wrap">
        <button
          @click="save"
          :disabled="saving"
          class="px-5 py-2 font-sans font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>

        <template v-if="activeNamespace === 'lastfm'">
          <button
            @click="testLastfm"
            :disabled="testing"
            class="px-5 py-2 font-sans font-medium text-brand-600 border border-brand-300 hover:bg-brand-50 rounded transition-colors disabled:opacity-50"
          >
            {{ testing ? 'Testing...' : 'Test connection' }}
          </button>
          <span
            v-if="testResult"
            class="font-sans text-sm"
            :class="testResult.ok ? 'text-green-600' : 'text-red-500'"
          >
            {{ testResult.message }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>
