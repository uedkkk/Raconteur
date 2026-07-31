<script setup lang="ts">
import { useSettingsStore, useSettingRef } from '~/stores/settings'

const settingsStore = useSettingsStore()
const appTitle = useSettingRef('app:title')
const appSlogan = useSettingRef('app:slogan')

await settingsStore.initSettings()

useHead({
  titleTemplate: (title) =>
    title ? `${title} · ${appTitle.value || 'Raconteur'}` : (appTitle.value || 'Raconteur'),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
