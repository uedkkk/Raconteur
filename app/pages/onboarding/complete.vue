<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

definePageMeta({ layout: 'onboarding' })

const store = useWizardStore()
const router = useRouter()
const submitting = ref(false)
const error = ref('')

const storageConfig = computed(() => {
  if (store.storage.provider === 's3') {
    return {
      provider: 's3',
      endpoint: store.storage['s3.endpoint'] || '',
      bucket: store.storage['s3.bucket'] || '',
      region: store.storage['s3.region'] || 'auto',
      accessKeyId: store.storage['s3.accessKeyId'] || '',
      secretAccessKey: store.storage['s3.secretAccessKey'] || '',
      prefix: store.storage['s3.prefix'] || '/photos',
      forcePathStyle: store.storage['s3.forcePathStyle'] ?? false,
    }
  }
  return {
    provider: 'local',
    basePath: store.storage['local.basePath'] || './data/storage',
    baseUrl: '/storage',
    prefix: 'photos/',
  }
})

async function submit() {
  submitting.value = true
  error.value = ''

  try {
    await $fetch('/api/wizard/submit', {
      method: 'POST',
      body: {
        admin: {
          email: store.admin.email,
          password: store.admin.password,
          username: store.admin.username,
        },
        site: {
          title: store.site.title,
          slogan: store.site.slogan || undefined,
          author: store.site.author || undefined,
        },
        storage: {
          name: 'Default Storage',
          config: storageConfig.value,
        },
      },
    })

    store.clear()
    window.location.href = '/dashboard'
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Failed to complete setup'
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-2 h-2 rounded-full bg-brand-500" />
        <div class="w-2 h-2 rounded-full bg-brand-500" />
        <div class="w-2 h-2 rounded-full bg-brand-500" />
        <div class="w-2 h-2 rounded-full bg-brand-500" />
      </div>
      <h1 class="font-display text-2xl font-bold text-neutral-900 mb-1">Review & Complete</h1>
      <p class="font-sans text-sm text-neutral-500">Confirm your settings and start writing.</p>
    </div>

    <div class="space-y-4 mb-6">
      <div class="p-4 bg-neutral-50 rounded">
        <p class="font-sans text-xs font-medium text-neutral-400 uppercase mb-2">Admin</p>
        <p class="font-sans text-sm text-neutral-900">{{ store.admin.username }} · {{ store.admin.email }}</p>
      </div>
      <div class="p-4 bg-neutral-50 rounded">
        <p class="font-sans text-xs font-medium text-neutral-400 uppercase mb-2">Site</p>
        <p class="font-sans text-sm text-neutral-900">{{ store.site.title }}</p>
        <p v-if="store.site.slogan" class="font-serif text-sm text-neutral-500 italic mt-1">{{ store.site.slogan }}</p>
      </div>
      <div class="p-4 bg-neutral-50 rounded">
        <p class="font-sans text-xs font-medium text-neutral-400 uppercase mb-2">Storage</p>
        <p class="font-sans text-sm text-neutral-900 capitalize">{{ store.storage.provider }}</p>
      </div>
    </div>

    <p v-if="error" class="font-sans text-sm text-red-500 mb-4">{{ error }}</p>

    <div class="flex justify-between">
      <NuxtLink to="/onboarding/storage"
        class="px-5 py-2 font-sans font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
        Back
      </NuxtLink>
      <button @click="submit" :disabled="submitting"
        class="px-6 py-2 font-sans font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors disabled:opacity-50">
        {{ submitting ? 'Setting up...' : 'Complete Setup' }}
      </button>
    </div>
  </div>
</template>
