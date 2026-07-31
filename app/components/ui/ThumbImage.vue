<script setup lang="ts">
const props = defineProps<{
  src?: string
  thumbhash?: string | null
  alt?: string
  thumbhashClass?: string
  imageContain?: boolean
}>()
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt || ''"
    class="w-full h-full object-contain"
    :class="$attrs.class"
  />
</template>
