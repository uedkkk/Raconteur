<script setup lang="ts">
definePageMeta({ layout: 'onboarding' })
</script>

<template>
  <div class="text-center">
    <h1 class="font-display text-4xl font-black text-neutral-900 mb-4">
      Welcome to Raconteur
    </h1>
    <p class="font-serif text-lg text-neutral-500 mb-8">
      A place for your stories and photos. Let's get you set up.
    </p>
    <NuxtLink
      to="/onboarding/admin"
      class="inline-block px-6 py-2.5 font-sans font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors no-underline"
    >
      Get Started
    </NuxtLink>
  </div>
</template>
