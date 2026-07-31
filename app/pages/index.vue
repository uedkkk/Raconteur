<script setup lang="ts">
const { data: posts } = await useFetch('/api/posts')

const appTitle = useSettingRef('app:title')
const appSlogan = useSettingRef('app:slogan')

useHead({
  title: appTitle.value || 'Raconteur',
})

function formatDate(date: string | Date) {
  return useDayjs()(date).format('MMM D, YYYY')
}
</script>

<template>
  <div class="mx-auto max-w-[740px] px-6 py-12">
    <div v-if="appSlogan" class="mb-12 text-center">
      <p class="font-serif text-lg text-neutral-500 italic">
        {{ appSlogan }}
      </p>
    </div>

    <div v-if="posts && posts.length > 0" class="space-y-12">
      <article v-for="post in posts" :key="post.id">
        <NuxtLink :to="`/posts/${post.slug}`" class="block no-underline group">
          <h2 class="font-display text-3xl font-bold text-neutral-900 mb-3 group-hover:text-brand-600 transition-colors">
            {{ post.title }}
          </h2>
          <p v-if="post.excerpt" class="font-serif text-lg text-neutral-600 leading-relaxed mb-2">
            {{ post.excerpt }}
          </p>
          <p class="font-sans text-sm text-neutral-400">
            {{ formatDate(post.publishedAt || post.createdAt) }}
          </p>
        </NuxtLink>
      </article>
    </div>

    <div v-else class="text-center py-20">
      <p class="font-serif text-xl text-neutral-400">
        No stories yet.
      </p>
    </div>
  </div>
</template>
