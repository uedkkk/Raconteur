<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const postId = computed(() => {
  const id = route.query.id
  return id ? Number(id) : null
})

const isEditing = computed(() => postId.value !== null)

const title = ref('')
const content = ref('')
const status = ref<'draft' | 'published'>('draft')
const excerpt = ref('')
const savedAt = ref<Date | null>(null)
const isSaving = ref(false)
const isDirty = ref(false)
let saveTimer: ReturnType<typeof setTimeout> | null = null

if (isEditing.value) {
  const { data: post } = await useFetch(`/api/posts/edit/${postId.value}`)

  if (post.value) {
    title.value = post.value.title
    content.value = post.value.content || ''
    status.value = post.value.status as 'draft' | 'published'
    if (post.value.excerpt) excerpt.value = post.value.excerpt
  }
}

watch([title, content], () => {
  isDirty.value = true
  scheduleAutoSave()
})

function scheduleAutoSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    savePost()
  }, 3000)
}

async function savePost() {
  if (!isDirty.value || isSaving.value) return
  if (!title.value.trim()) return

  isSaving.value = true
  isDirty.value = false

  try {
    if (isEditing.value && postId.value) {
      await $fetch(`/api/posts/${postId.value}`, {
        method: 'PUT',
        body: {
          title: title.value,
          content: content.value,
          excerpt: excerpt.value || undefined,
          status: status.value,
        },
      })
    } else {
      const result = await $fetch('/api/posts', {
        method: 'POST',
        body: {
          title: title.value,
          content: content.value,
          excerpt: excerpt.value || undefined,
          status: status.value,
        },
      }) as any

      if (result.id) {
        router.replace({ path: '/dashboard/editor', query: { id: result.id } })
      }
    }
    savedAt.value = new Date()
  } catch (error) {
    console.error('Failed to save:', error)
    isDirty.value = true
  } finally {
    isSaving.value = false
  }
}

async function publishPost() {
  status.value = 'published'
  await savePost()
}

async function unpublishPost() {
  status.value = 'draft'
  await savePost()
}

onBeforeRouteLeave(async () => {
  if (isDirty.value) {
    await savePost()
  }
})

const savedTimeText = computed(() => {
  if (!savedAt.value) return ''
  return useDayjs()(savedAt.value).format('HH:mm:ss')
})
</script>

<template>
  <div class="h-screen flex flex-col bg-white">
    <div class="flex items-center justify-between px-6 py-3 border-b border-neutral-200">
      <div class="flex items-center gap-3">
        <NuxtLink to="/dashboard/posts" class="text-neutral-400 hover:text-neutral-900 transition-colors">
          <UIcon name="i-lucide-arrow-left" class="text-xl" />
        </NuxtLink>
        <span
          class="font-sans text-xs px-2 py-0.5 rounded"
          :class="status === 'published' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'"
        >
          {{ status === 'published' ? 'Published' : 'Draft' }}
        </span>
        <span v-if="isSaving" class="font-sans text-xs text-neutral-400">Saving...</span>
        <span v-else-if="savedTimeText" class="font-sans text-xs text-neutral-400">Saved at {{ savedTimeText }}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="status === 'draft'"
          @click="publishPost"
          class="px-4 py-1.5 text-sm font-sans font-medium text-white bg-brand-500 hover:bg-brand-600 rounded transition-colors"
        >
          Publish
        </button>
        <button
          v-else
          @click="unpublishPost"
          class="px-4 py-1.5 text-sm font-sans font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          Unpublish
        </button>
      </div>
    </div>

    <div class="px-6 pt-6 pb-3">
      <input
        v-model="title"
        type="text"
        placeholder="Title"
        class="w-full font-display text-3xl font-bold text-neutral-900 bg-transparent border-none outline-none placeholder:text-neutral-300"
      />
    </div>

    <div class="flex-1 overflow-hidden">
      <BlogMarkdownEditor v-model="content" />
    </div>
  </div>
</template>
