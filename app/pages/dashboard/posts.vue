<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { data: posts, refresh } = await useFetch('/api/posts/all')

const deletingId = ref<number | null>(null)

async function deletePost(id: number) {
  if (!confirm('Delete this post? This cannot be undone.')) return
  deletingId.value = id
  try {
    await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    console.error('Failed to delete post:', e)
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="p-8 max-w-5xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-2xl font-bold text-neutral-900">Posts</h1>
      <NuxtLink to="/dashboard/editor"
        class="flex items-center gap-1.5 px-4 py-2 font-sans text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors no-underline">
        <UIcon name="i-lucide-plus" class="text-base" />
        New Post
      </NuxtLink>
    </div>

    <div v-if="posts && posts.length > 0" class="bg-white border border-neutral-200 rounded overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-neutral-200 bg-neutral-50">
            <th class="text-left px-4 py-3 font-sans text-xs font-medium text-neutral-400 uppercase">Title</th>
            <th class="text-left px-4 py-3 font-sans text-xs font-medium text-neutral-400 uppercase">Status</th>
            <th class="text-left px-4 py-3 font-sans text-xs font-medium text-neutral-400 uppercase">Updated</th>
            <th class="text-right px-4 py-3 font-sans text-xs font-medium text-neutral-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id" class="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
            <td class="px-4 py-3">
              <NuxtLink :to="`/dashboard/editor?id=${post.id}`" class="font-sans text-sm text-neutral-900 hover:text-brand-600 no-underline">
                {{ post.title || 'Untitled' }}
              </NuxtLink>
            </td>
            <td class="px-4 py-3">
              <span
                class="font-sans text-xs px-2 py-0.5 rounded"
                :class="post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'"
              >
                {{ post.status }}
              </span>
            </td>
            <td class="px-4 py-3 font-sans text-sm text-neutral-400">
              {{ useDayjs()(post.updatedAt).format('MMM D, YYYY HH:mm') }}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink :to="`/dashboard/editor?id=${post.id}`"
                  class="p-1.5 text-neutral-400 hover:text-brand-600 transition-colors no-inline-block">
                  <UIcon name="i-lucide-pencil" class="text-base" />
                </NuxtLink>
                <button
                  @click="deletePost(post.id)"
                  :disabled="deletingId === post.id"
                  class="p-1.5 text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <UIcon :name="deletingId === post.id ? 'i-lucide-loader-2' : 'i-lucide-trash-2'" class="text-base" :class="deletingId === post.id ? 'animate-spin' : ''" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-20">
      <p class="font-serif text-lg text-neutral-400 mb-4">No posts yet.</p>
      <NuxtLink to="/dashboard/editor"
        class="inline-block px-4 py-2 font-sans text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors no-underline">
        Write your first post
      </NuxtLink>
    </div>
  </div>
</template>
