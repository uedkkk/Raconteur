<script setup lang="ts">
const appTitle = useSettingRef('app:title')

const navItems = [
  { label: 'Overview', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
  { label: 'Posts', to: '/dashboard/posts', icon: 'i-lucide-file-text' },
  { label: 'Photos', to: '/dashboard/photos', icon: 'i-lucide-image' },
  { label: 'Queue', to: '/dashboard/queue', icon: 'i-lucide-list-checks' },
  { label: 'Settings', to: '/dashboard/settings', icon: 'i-lucide-settings' },
]

const route = useRoute()
const isActive = (to: string) => {
  if (to === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex">
    <aside class="w-56 border-r border-neutral-200 bg-white flex flex-col flex-shrink-0">
      <div class="px-5 py-5 border-b border-neutral-200">
        <NuxtLink to="/" class="font-display text-lg font-bold text-neutral-900 no-underline">
          {{ appTitle || 'Raconteur' }}
        </NuxtLink>
      </div>
      <nav class="flex-1 px-3 py-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2.5 px-3 py-2 rounded font-sans text-sm no-underline transition-colors"
          :class="isActive(item.to)
            ? 'bg-brand-50 text-brand-700 font-medium'
            : 'text-neutral-600 hover:bg-neutral-100'"
        >
          <UIcon :name="item.icon" class="text-base" />
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="px-3 py-4 border-t border-neutral-200">
        <NuxtLink to="/" class="flex items-center gap-2.5 px-3 py-2 rounded font-sans text-sm text-neutral-600 hover:bg-neutral-100 no-underline transition-colors">
          <UIcon name="i-lucide-external-link" class="text-base" />
          View Site
        </NuxtLink>
      </div>
    </aside>

    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>
