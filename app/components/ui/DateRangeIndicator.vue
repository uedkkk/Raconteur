<script setup lang="ts">
defineProps<{
  startDate?: string
  endDate?: string
}>()
</script>

<template>
  <span v-if="startDate || endDate" class="font-sans text-sm text-neutral-400">
    <template v-if="startDate && endDate">{{ startDate }} – {{ endDate }}</template>
    <template v-else-if="startDate">{{ startDate }}</template>
    <template v-else>{{ endDate }}</template>
  </span>
</template>
