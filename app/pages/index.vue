<script setup lang="ts">
const { data: posts } = await useFetch('/api/posts')
const { data: photos } = await useFetch<Photo[]>('/api/photos/visible', {
  default: () => [],
})

const appTitle = useSettingRef('app:title')

useHead({
  title: appTitle.value || 'Raconteur',
})

const featuredPost = computed(() => posts.value?.[0] ?? null)
const recentPosts = computed(() => posts.value?.slice(1) ?? [])
const recentPhotos = computed(() => photos.value?.slice(0, 4) ?? [])

const dayjs = useDayjs()

function formatDateFull(date: string | Date) {
  return dayjs(date).format('MMMM D, YYYY')
}
function formatDateShort(date: string | Date) {
  return dayjs(date).format('MMM D')
}

function thumbUrl(photo: Photo) {
  if (photo.thumbnailUrl) return photo.thumbnailUrl
  if (photo.thumbnailKey) return `/thumb/${photo.thumbnailKey}`
  if (photo.storageKey) return `/storage/${photo.storageKey}`
  return ''
}
</script>

<template>
  <div class="mx-auto max-w-[900px] px-8">
    <!-- Featured -->
    <section v-if="featuredPost" class="pt-12">
      <div class="flex items-center gap-3 mb-4">
        <span class="font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-500">Latest post</span>
        <span class="flex-1 h-px bg-neutral-200" />
      </div>
      <h2 class="font-display font-bold text-[36px] leading-[1.05] tracking-[-0.025em] mb-5 font-opsz-144">
        <NuxtLink :to="`/posts/${featuredPost.slug}`" class="no-underline text-neutral-900 hover:text-brand-500 transition-colors">
          {{ featuredPost.title }}
        </NuxtLink>
      </h2>
      <p v-if="featuredPost.excerpt" class="font-serif text-[17px] leading-[1.6] text-neutral-500 line-clamp-3">
        {{ featuredPost.excerpt }}
      </p>
      <p class="font-sans text-xs font-medium text-neutral-500 mt-[18px]">
        {{ formatDateFull(featuredPost.publishedAt || featuredPost.createdAt) }}
        <span class="mx-1">·</span>
        <NuxtLink :to="`/posts/${featuredPost.slug}`" class="text-brand-500 no-underline border-b-2 border-brand-500 pb-px">Read post →</NuxtLink>
      </p>
    </section>

    <!-- Articles -->
    <section v-if="recentPosts.length > 0" class="pt-14">
      <article
        v-for="post in recentPosts"
        :key="post.id"
        class="grid grid-cols-[120px_1fr] gap-8 border-t border-neutral-200 py-7"
      >
        <div class="font-display font-bold text-sm uppercase tracking-[0.05em] text-brand-500 pt-1">
          {{ formatDateShort(post.publishedAt || post.createdAt) }}
        </div>
        <div>
          <h3 class="font-display font-semibold text-[22px] leading-[1.15] tracking-[-0.01em] mb-2.5">
            <NuxtLink :to="`/posts/${post.slug}`" class="no-underline text-neutral-900 hover:text-brand-500 transition-colors">
              {{ post.title }}
            </NuxtLink>
          </h3>
          <p v-if="post.excerpt" class="font-serif text-sm leading-[1.6] text-neutral-500 line-clamp-3">
            {{ post.excerpt }}
          </p>
        </div>
      </article>
    </section>

    <!-- Photos -->
    <section id="photographs" v-if="recentPhotos.length > 0" class="pt-14">
      <div class="flex justify-between items-baseline mb-6 pb-3 border-b-4 border-neutral-900">
        <h3 class="font-display font-black text-2xl tracking-[-0.02em]">Photographs</h3>
        <NuxtLink to="/photos" class="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-brand-500 no-underline">
          View all →
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 gap-5 mb-14">
        <NuxtLink
          v-for="photo in recentPhotos"
          :key="photo.id"
          :to="`/photos/${photo.id}`"
          class="no-underline"
        >
          <img
            :src="thumbUrl(photo)"
            :alt="photo.title || ''"
            class="w-full h-[300px] object-cover"
            loading="lazy"
          />
          <div class="font-sans text-xs font-medium text-neutral-500 mt-2 flex gap-2 items-center">
            <span v-if="photo.title" class="text-neutral-900 font-semibold">{{ photo.title }}</span>
            <span v-if="photo.title && photo.dateTaken" class="text-neutral-300">·</span>
            <span v-if="photo.dateTaken">{{ formatDateFull(photo.dateTaken) }}</span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Empty state -->
    <div v-if="!featuredPost && recentPhotos.length === 0" class="text-center py-20">
      <p class="font-serif text-xl text-neutral-400">No stories yet.</p>
    </div>
  </div>
</template>
