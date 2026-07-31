<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

definePageMeta({ layout: 'onboarding' })

const store = useWizardStore()
const router = useRouter()

const provider = ref(store.storage.provider || 'local')

const localPath = ref(store.storage['local.basePath'] || './data/storage')
const s3Endpoint = ref(store.storage['s3.endpoint'] || '')
const s3Bucket = ref(store.storage['s3.bucket'] || '')
const s3Region = ref(store.storage['s3.region'] || 'auto')
const s3AccessKey = ref(store.storage['s3.accessKeyId'] || '')
const s3SecretKey = ref(store.storage['s3.secretAccessKey'] || '')

function next() {
  store.updateStorage({
    provider: provider.value,
    name: 'Default Storage',
    'local.basePath': localPath.value,
    'local.baseUrl': '/storage',
    'local.prefix': 'photos/',
    's3.endpoint': s3Endpoint.value,
    's3.bucket': s3Bucket.value,
    's3.region': s3Region.value,
    's3.accessKeyId': s3AccessKey.value,
    's3.secretAccessKey': s3SecretKey.value,
    's3.prefix': '/photos',
    's3.forcePathStyle': false,
  })
  router.push('/onboarding/complete')
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-2 h-2 rounded-full bg-brand-500" />
        <div class="w-2 h-2 rounded-full bg-brand-500" />
        <div class="w-2 h-2 rounded-full bg-brand-500" />
        <div class="w-2 h-2 rounded-full bg-neutral-200" />
      </div>
      <h1 class="font-display text-2xl font-bold text-neutral-900 mb-1">Storage</h1>
      <p class="font-sans text-sm text-neutral-500">Where should photos be stored?</p>
    </div>

    <div class="space-y-4">
      <div class="flex gap-3">
        <button @click="provider = 'local'"
          :class="provider === 'local' ? 'border-brand-500 bg-brand-50' : 'border-neutral-300'"
          class="flex-1 p-4 border-2 rounded text-left transition-colors">
          <p class="font-sans font-medium text-neutral-900">Local Storage</p>
          <p class="font-sans text-xs text-neutral-500 mt-1">Store photos on the server filesystem</p>
        </button>
        <button @click="provider = 's3'"
          :class="provider === 's3' ? 'border-brand-500 bg-brand-50' : 'border-neutral-300'"
          class="flex-1 p-4 border-2 rounded text-left transition-colors">
          <p class="font-sans font-medium text-neutral-900">S3 Compatible</p>
          <p class="font-sans text-xs text-neutral-500 mt-1">AWS S3, R2, MinIO, etc.</p>
        </button>
      </div>

      <template v-if="provider === 'local'">
        <div>
          <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Storage Path</label>
          <input v-model="localPath" type="text"
            class="w-full px-3 py-2 font-mono text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
        </div>
      </template>

      <template v-if="provider === 's3'">
        <div>
          <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Endpoint</label>
          <input v-model="s3Endpoint" type="text" placeholder="https://s3.example.com"
            class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
        </div>
        <div>
          <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Bucket</label>
          <input v-model="s3Bucket" type="text"
            class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Region</label>
            <input v-model="s3Region" type="text"
              class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
          </div>
          <div>
            <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Access Key</label>
            <input v-model="s3AccessKey" type="text"
              class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
          </div>
        </div>
        <div>
          <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Secret Key</label>
          <input v-model="s3SecretKey" type="password"
            class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
        </div>
      </template>
    </div>

    <div class="flex justify-between mt-6">
      <NuxtLink to="/onboarding/site"
        class="px-5 py-2 font-sans font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
        Back
      </NuxtLink>
      <button @click="next"
        class="px-5 py-2 font-sans font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors">
        Next
      </button>
    </div>
  </div>
</template>
