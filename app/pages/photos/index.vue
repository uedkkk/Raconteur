<script setup lang="ts">
const { data: photos } = await useFetch<Photo[]>('/api/photos/visible', {
  default: () => [],
})

useHead({ title: 'Photographs' })

const thumbUrl = (photo: Photo) => {
  if (photo.thumbnailUrl) return photo.thumbnailUrl
  if (photo.thumbnailKey) return `/thumb/${photo.thumbnailKey}`
  if (photo.storageKey) return `/storage/${photo.storageKey}`
  return ''
}

function getAspectRatio(photo: Photo): number {
  if (photo.aspectRatio) return photo.aspectRatio
  if (photo.width && photo.height) return photo.width / photo.height
  return 1.2
}

const dayjs = useDayjs()
const formatDate = (date: string | null) => {
  if (!date) return ''
  return dayjs(date).format('MMM D, YYYY')
}
</script>

<template>
  <div class="mx-auto max-w-[900px] px-8 pt-12">
    <div class="flex justify-between items-baseline mb-6 pb-3 border-b-4 border-neutral-900">
      <h1 class="font-display font-black text-2xl tracking-[-0.02em]">Photographs</h1>
      <span class="font-sans text-xs font-medium uppercase tracking-[0.08em] text-neutral-500">
        {{ photos?.length || 0 }} frames
      </span>
    </div>

    <div v-if="photos && photos.length > 0" class="columns-2 gap-5 mb-14">
      <NuxtLink
        v-for="photo in photos"
        :key="photo.id"
        :to="`/photos/${photo.id}`"
        class="no-underline group break-inside-avoid mb-5 block"
      >
        <div class="overflow-hidden">
          <img
            :src="thumbUrl(photo)"
            :alt="photo.title || ''"
            class="w-full object-cover transition-transform group-hover:scale-[1.02]"
            :style="{ aspectRatio: getAspectRatio(photo) }"
            loading="lazy"
          />
        </div>
        <div class="font-sans text-xs font-medium text-neutral-500 mt-2 flex gap-2 items-center">
          <span v-if="photo.title" class="text-neutral-900 font-semibold">{{ photo.title }}</span>
          <span v-if="photo.title && (photo.city || photo.dateTaken)" class="text-neutral-300">·</span>
          <span v-if="photo.city">{{ photo.city }}</span>
          <span v-if="photo.city && photo.dateTaken" class="text-neutral-300">·</span>
          <span v-if="photo.dateTaken">{{ formatDate(photo.dateTaken) }}</span>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="text-center py-20">
      <p class="font-serif text-xl text-neutral-400">No photographs yet.</p>
    </div>
  </div>
</template>
