<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { data: stats } = await useFetch('/api/system/stats')
const { data: posts } = await useFetch('/api/posts/all')

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

const formatUptime = (seconds: number) => {
  if (!seconds) return '—'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

const publishedCount = computed(() => posts.value?.filter((p: any) => p.status === 'published').length || 0)
const draftCount = computed(() => posts.value?.filter((p: any) => p.status === 'draft').length || 0)
</script>

<template>
  <div class="p-8 max-w-5xl">
    <h1 class="font-display text-2xl font-bold text-neutral-900 mb-6">Overview</h1>

    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="p-5 bg-white border border-neutral-200 rounded">
        <p class="font-sans text-xs text-neutral-400 uppercase mb-1">Photos</p>
        <p class="font-display text-2xl font-bold text-neutral-900">{{ stats?.photos?.total || 0 }}</p>
        <p class="font-sans text-xs text-neutral-400 mt-1">{{ stats?.photos?.today || 0 }} today</p>
      </div>
      <div class="p-5 bg-white border border-neutral-200 rounded">
        <p class="font-sans text-xs text-neutral-400 uppercase mb-1">Published</p>
        <p class="font-display text-2xl font-bold text-neutral-900">{{ publishedCount }}</p>
        <p class="font-sans text-xs text-neutral-400 mt-1">{{ draftCount }} drafts</p>
      </div>
      <div class="p-5 bg-white border border-neutral-200 rounded">
        <p class="font-sans text-xs text-neutral-400 uppercase mb-1">Storage</p>
        <p class="font-display text-2xl font-bold text-neutral-900">{{ formatBytes(stats?.storage?.totalSize || 0) }}</p>
        <p class="font-sans text-xs text-neutral-400 mt-1">avg {{ formatBytes(stats?.storage?.averageSize || 0) }}/photo</p>
      </div>
      <div class="p-5 bg-white border border-neutral-200 rounded">
        <p class="font-sans text-xs text-neutral-400 uppercase mb-1">Uptime</p>
        <p class="font-display text-2xl font-bold text-neutral-900">{{ formatUptime(stats?.uptime || 0) }}</p>
        <p class="font-sans text-xs text-neutral-400 mt-1">{{ stats?.runningOn || 'unknown' }}</p>
      </div>
    </div>

    <div class="p-5 bg-white border border-neutral-200 rounded">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-sans font-semibold text-neutral-900">Recent Posts</h2>
        <NuxtLink to="/dashboard/posts" class="font-sans text-sm text-brand-600 hover:text-brand-700 no-underline">
          View all
        </NuxtLink>
      </div>
      <div v-if="posts && posts.length > 0" class="space-y-2">
        <div v-for="post in posts.slice(0, 5)" :key="post.id" class="flex items-center justify-between py-2">
          <div class="flex items-center gap-3">
            <span
              class="font-sans text-xs px-2 py-0.5 rounded"
              :class="post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'"
            >
              {{ post.status }}
            </span>
            <NuxtLink :to="`/dashboard/editor?id=${post.id}`" class="font-sans text-sm text-neutral-900 hover:text-brand-600 no-underline">
              {{ post.title }}
            </NuxtLink>
          </div>
          <span class="font-sans text-xs text-neutral-400">
            {{ useDayjs()(post.updatedAt).format('MMM D, YYYY') }}
          </span>
        </div>
      </div>
      <p v-else class="font-sans text-sm text-neutral-400 py-4 text-center">No posts yet.</p>
    </div>
  </div>
</template>
