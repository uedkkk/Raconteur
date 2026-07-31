<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

definePageMeta({ layout: 'onboarding' })

const store = useWizardStore()
const router = useRouter()

const title = ref(store.site.title || 'Raconteur')
const slogan = ref(store.site.slogan || '')
const author = ref(store.site.author || '')

function next() {
  store.updateSite({
    title: title.value,
    slogan: slogan.value,
    author: author.value,
  })
  router.push('/onboarding/storage')
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-2 h-2 rounded-full bg-brand-500" />
        <div class="w-2 h-2 rounded-full bg-brand-500" />
        <div class="w-2 h-2 rounded-full bg-neutral-200" />
        <div class="w-2 h-2 rounded-full bg-neutral-200" />
      </div>
      <h1 class="font-display text-2xl font-bold text-neutral-900 mb-1">Site Settings</h1>
      <p class="font-sans text-sm text-neutral-500">Configure your blog's basic information.</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Site Title</label>
        <input v-model="title" type="text" placeholder="My Blog"
          class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Slogan (optional)</label>
        <input v-model="slogan" type="text" placeholder="A place for stories"
          class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Author (optional)</label>
        <input v-model="author" type="text" placeholder="Your name"
          class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
    </div>

    <div class="flex justify-between mt-6">
      <NuxtLink to="/onboarding/admin"
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
