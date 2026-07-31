<script setup lang="ts">
interface ExifItem {
  label: string
  value: string
}

defineProps<{
  title: string
  items: ExifItem[]
}>()
</script>

<template>
  <div>
    <h3 class="font-sans text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">{{ title }}</h3>
    <dl class="space-y-1.5">
      <div v-for="item in items" :key="item.label" class="flex justify-between gap-3">
        <dt class="font-sans text-sm text-neutral-500 shrink-0">{{ item.label }}</dt>
        <dd class="font-sans text-sm text-neutral-200 text-right break-all">{{ item.value }}</dd>
      </div>
    </dl>
  </div>
</template>
