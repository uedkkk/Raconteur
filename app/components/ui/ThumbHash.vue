<script setup lang="ts">
const props = defineProps<{
  thumbhash?: string | null
  width?: number
  height?: number
}>()
</script>

<template>
  <div
    v-if="thumbhash"
    class="bg-neutral-200 animate-pulse"
    :class="$attrs.class"
    :style="{ width: props.width ? `${props.width}px` : '100%', height: props.height ? `${props.height}px` : '100%' }"
  />
</template>
