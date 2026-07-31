<script setup lang="ts">
const appTitle = useSettingRef('app:title')
const appSlogan = useSettingRef('app:slogan')
</script>

<template>
  <div class="min-h-screen bg-white">
    <header class="border-b border-neutral-200">
      <div class="mx-auto max-w-[740px] px-6 py-5 flex items-center justify-between">
        <NuxtLink to="/" class="font-display text-xl font-bold text-neutral-900 no-underline">
          {{ appTitle || 'Raconteur' }}
        </NuxtLink>
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/photos"
            class="font-sans text-sm text-neutral-600 hover:text-brand-600 no-underline transition-colors"
          >
            Photos
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="font-sans text-sm text-neutral-600 hover:text-brand-600 no-underline transition-colors"
          >
            Dashboard
          </NuxtLink>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="border-t border-neutral-200 mt-20">
      <div class="mx-auto max-w-[740px] px-6 py-8">
        <p class="font-sans text-sm text-neutral-400">
          {{ appTitle || 'Raconteur' }}{{ appSlogan ? ` · ${appSlogan}` : '' }}
        </p>
      </div>
    </footer>
  </div>
</template>
