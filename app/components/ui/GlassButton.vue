<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'glass'
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <button
    class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded font-sans text-sm font-medium transition-colors hover:bg-neutral-100"
    :class="$attrs.class"
  >
    <slot />
  </button>
</template>
