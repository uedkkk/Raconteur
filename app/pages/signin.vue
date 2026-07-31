<script setup lang="ts">
definePageMeta({ layout: 'onboarding' })

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    window.location.href = '/dashboard'
  } catch (e: any) {
    error.value = e.data?.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="font-display text-2xl font-bold text-neutral-900 mb-1">Sign In</h1>
    <p class="font-sans text-sm text-neutral-500 mb-6">Welcome back.</p>

    <form @submit.prevent="login" class="space-y-4">
      <div>
        <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Email</label>
        <input v-model="email" type="email" required
          class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label class="block font-sans text-sm font-medium text-neutral-700 mb-1">Password</label>
        <input v-model="password" type="password" required
          class="w-full px-3 py-2 font-sans text-sm border border-neutral-300 rounded focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <p v-if="error" class="font-sans text-sm text-red-500">{{ error }}</p>
      <button type="submit" :disabled="loading"
        class="w-full px-5 py-2.5 font-sans font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors disabled:opacity-50">
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>
  </div>
</template>
