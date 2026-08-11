<script setup lang="ts">
import { useSettingsStore, useSettingRef } from '~/stores/settings'

const settingsStore = useSettingsStore()
const appTitle = useSettingRef('app:title')
const appSlogan = useSettingRef('app:slogan')
const faviconUrl = useSettingRef('app:faviconUrl')

await settingsStore.initSettings()

useHead({
  titleTemplate: (title) =>
    title ? `${title} · ${appTitle.value || 'Raconteur'}` : (appTitle.value || 'Raconteur'),
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: () => (faviconUrl.value as string) || '/favicon.ico',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
