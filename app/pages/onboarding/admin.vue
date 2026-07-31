<script setup lang="ts">
import { useWizardStore } from '~/stores/wizard'

definePageMeta({ layout: 'onboarding' })

const store = useWizardStore()
const router = useRouter()

const email = ref(store.admin.email || '')
const username = ref(store.admin.username || 'admin')
const password = ref(store.admin.password || '')
const confirmPassword = ref(store.admin.confirmPassword || '')
const error = ref('')

function next() {
  if (!email.value || !password.value || !username.value) {
    error.value = 'All fields are required'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  store.updateAdmin({
    email: email.value,
    username: username.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  })
  router.push('/onboarding/site')
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-2 h-2 rounded-full bg-brand-500" />
        <div class="w-2 h-2 rounded-full bg-neutral-200" />
        <div class="w-2 h-2 rounded-full bg-neutral-200" />
        <div class="w-2 h-2 rounded-full bg-neutral-200" />
      </div>
      <h1 class="font-display text-2xl font-bold text-neutral-900 mb-1">Admin Account</h1>
      <p class="font-sans text-sm text-neutral-500">Create your admin account to manage the site.</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Username</label>
        <input v-model="username" type="text" placeholder="admin"
          class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Email</label>
        <input v-model="email" type="email" placeholder="admin@example.com"
          class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Password</label>
        <input v-model="password" type="password" placeholder="At least 6 characters"
          class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Confirm Password</label>
        <input v-model="confirmPassword" type="password"
          class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <p v-if="error" class="font-sans text-sm text-red-500">{{ error }}</p>
    </div>

    <div class="flex justify-end mt-6">
      <button @click="next"
        class="px-5 py-2 font-sans font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors">
        Next
      </button>
    </div>
  </div>
</template>
