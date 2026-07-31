<script setup lang="ts">
const { data: photos } = await useFetch<Photo[]>('/api/photos/visible', {
  default: () => [],
})

const thumbUrl = (photo: Photo) => {
  if (photo.thumbnailUrl) return photo.thumbnailUrl
  if (photo.thumbnailKey) return `/thumb/${photo.thumbnailKey}`
  if (photo.storageKey) return `/storage/${photo.storageKey}`
  return ''
}

const formatDate = (date: string | null) => {
  if (!date) return ''
  return useDayjs()(date).format('MMMM D, YYYY')
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto max-w-[1200px] px-4 py-8">
      <h1 class="font-display text-3xl font-bold text-neutral-900 mb-8">Photos</h1>

      <div v-if="photos && photos.length > 0" class="columns-2 md:columns-3 lg:columns-4 gap-3 [&>*]:mb-3">
        <NuxtLink
          v-for="photo in photos"
          :key="photo.id"
          :to="`/photos/${photo.id}`"
          class="relative overflow-hidden rounded block break-inside-avoid group"
        >
          <img
            :src="thumbUrl(photo)"
            :alt="photo.title || ''"
            class="w-full h-auto object-cover transition-transform group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div v-if="photo.title || photo.city" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <p v-if="photo.title" class="font-sans text-sm text-white font-medium">{{ photo.title }}</p>
            <p v-if="photo.city" class="font-sans text-xs text-white/80">{{ photo.city }}</p>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-32">
        <UIcon name="i-lucide-image" class="text-4xl text-neutral-300 mb-4" />
        <p class="font-serif text-lg text-neutral-400">No photos yet.</p>
      </div>
    </div>
  </div>
</template>
