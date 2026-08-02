<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { data: photos, refresh } = await useFetch('/api/photos')

const uploading = ref(false)
const uploadProgress = ref('')
const deletingId = ref<number | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const uploadErrors = ref<string[]>([])
const scanning = ref(false)
const scanResult = ref<string>('')

const selectedIds = ref<Set<string>>(new Set())
const batchDeleting = ref(false)

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
}

function toggleSelectAll() {
  if (!photos.value) return
  if (selectedIds.value.size === photos.value.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(photos.value.map((p: any) => p.id))
  }
}

function clearSelection() {
  selectedIds.value = new Set()
}

async function batchDelete() {
  if (selectedIds.value.size === 0) return
  if (!confirm(`Delete ${selectedIds.value.size} photos? This cannot be undone.`)) return
  batchDeleting.value = true
  try {
    const res = await $fetch<{ deleted: number; failed: number }>('/api/photos/batch', {
      method: 'DELETE',
      body: { ids: Array.from(selectedIds.value) },
    })
    if (res.failed > 0) {
      scanResult.value = `Deleted ${res.deleted}, ${res.failed} failed.`
    }
    selectedIds.value = new Set()
    await refresh()
  } catch (e: any) {
    console.error('Failed to batch delete:', e)
  } finally {
    batchDeleting.value = false
  }
}

async function handleFiles(files: FileList | null) {
  if (!files || files.length === 0) return
  uploading.value = true
  uploadErrors.value = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    uploadProgress.value = `Uploading ${i + 1}/${files.length}: ${file.name}`

    try {
      // Step 1: Get upload URL
      const prepareRes = await $fetch<{ signedUrl: string; fileKey: string; skipped?: boolean }>('/api/photos', {
        method: 'POST',
        body: { fileName: file.name, contentType: file.type },
      })

      if (prepareRes.skipped) continue

      // Step 2: Upload file to storage
      await $fetch(prepareRes.signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      })

      // Step 3: Add to processing queue
      await $fetch('/api/queue/add-task', {
        method: 'POST',
        body: {
          payload: { type: 'photo', storageKey: prepareRes.fileKey },
        },
      })
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || 'Unknown error'
      uploadErrors.value.push(`${file.name}: ${msg}`)
      console.error(`Failed to upload ${file.name}:`, e)
    }
  }

  uploading.value = false
  uploadProgress.value = ''
  await refresh()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  handleFiles(target.files)
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  handleFiles(e.dataTransfer?.files || null)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

async function scanStorage() {
  scanning.value = true
  scanResult.value = ''
  try {
    const res = await $fetch<{ totalFound: number; alreadyExists: number; newQueued: number; failed: number }>('/api/photos/scan', {
      method: 'POST',
    })
    if (res.newQueued > 0) {
      scanResult.value = `Found ${res.totalFound} images, ${res.alreadyExists} already imported, ${res.newQueued} queued for processing.`
    } else if (res.totalFound > 0) {
      scanResult.value = `Found ${res.totalFound} images, all already imported.`
    } else {
      scanResult.value = 'No images found in storage.'
    }
    await refresh()
  } catch (e: any) {
    scanResult.value = `Scan failed: ${e?.data?.message || e?.message || 'Unknown error'}`
  } finally {
    scanning.value = false
  }
}

async function deletePhoto(id: number) {
  if (!confirm('Delete this photo? This cannot be undone.')) return
  deletingId.value = id
  try {
    await $fetch(`/api/photos/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    console.error('Failed to delete photo:', e)
  } finally {
    deletingId.value = null
  }
}

const thumbUrl = (photo: any) => {
  if (photo.thumbnailUrl) return `/thumb/${photo.thumbnailUrl}`
  if (photo.thumbnailKey) return `/thumb/${photo.thumbnailKey}`
  if (photo.storageKey) return `/image/${photo.storageKey}?w=200`
  return ''
}
</script>

<template>
  <div class="p-8 max-w-5xl">
    <h1 class="font-display text-2xl font-bold text-neutral-900 mb-6">Photos</h1>

    <div
      @drop="onDrop"
      @dragover="onDragOver"
      @click="fileInput?.click()"
      class="mb-6 p-8 border-2 border-dashed border-neutral-300 rounded text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/30 transition-colors"
    >
      <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="onFileChange" />
      <template v-if="uploading">
        <UIcon name="i-lucide-loader-2" class="text-2xl text-brand-500 animate-spin mb-2" />
        <p class="font-sans text-sm text-neutral-500">{{ uploadProgress }}</p>
      </template>
      <template v-else>
        <UIcon name="i-lucide-upload" class="text-2xl text-neutral-400 mb-2" />
        <p class="font-sans text-sm text-neutral-500">Drop photos here or click to upload</p>
      </template>
    </div>

    <div class="mb-4 flex items-center gap-3">
      <button
        @click="scanStorage"
        :disabled="scanning"
        class="px-3 py-1.5 text-sm font-sans text-neutral-600 border border-neutral-300 rounded hover:bg-neutral-50 transition-colors disabled:opacity-50"
      >
        <UIcon :name="scanning ? 'i-lucide-loader-2' : 'i-lucide-scan'" class="text-sm mr-1" :class="scanning ? 'animate-spin' : ''" />
        Scan Storage
      </button>
      <span v-if="scanResult" class="font-sans text-xs text-neutral-500">{{ scanResult }}</span>
    </div>

    <!-- Batch toolbar -->
    <div v-if="photos && photos.length > 0" class="mb-4 flex items-center gap-3">
      <label class="flex items-center gap-1.5 cursor-pointer">
        <input type="checkbox" :checked="selectedIds.size === photos.length && photos.length > 0" @change="toggleSelectAll"
          class="w-4 h-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-500" />
        <span class="font-sans text-sm text-neutral-600">Select All</span>
      </label>
      <template v-if="selectedIds.size > 0">
        <span class="font-sans text-xs text-neutral-400">{{ selectedIds.size }} selected</span>
        <button
          @click="batchDelete"
          :disabled="batchDeleting"
          class="px-3 py-1 text-sm font-sans text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <UIcon :name="batchDeleting ? 'i-lucide-loader-2' : 'i-lucide-trash-2'" class="text-sm mr-1" :class="batchDeleting ? 'animate-spin' : ''" />
          Delete Selected
        </button>
        <button
          @click="clearSelection"
          class="px-2 py-1 text-sm font-sans text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Cancel
        </button>
      </template>
    </div>

    <div v-if="uploadErrors.length > 0" class="mb-4 p-3 bg-red-50 border border-red-200 rounded">
      <p class="font-sans text-sm text-red-700 mb-1">Some uploads failed:</p>
      <ul class="font-sans text-xs text-red-600 list-disc list-inside">
        <li v-for="err in uploadErrors" :key="err">{{ err }}</li>
      </ul>
    </div>

    <div v-if="photos && photos.length > 0" class="grid grid-cols-4 gap-3">
      <div v-for="photo in photos" :key="photo.id" class="relative group aspect-square overflow-hidden rounded bg-neutral-100"
        :class="selectedIds.has(photo.id) ? 'ring-2 ring-brand-500' : ''">
        <img :src="thumbUrl(photo)" :alt="photo.fileName" class="w-full h-full object-cover" loading="lazy" />
        <input
          type="checkbox"
          :checked="selectedIds.has(photo.id)"
          @change="toggleSelect(photo.id)"
          @click.stop
          class="absolute top-2 left-2 w-4 h-4 rounded border-white bg-white/80 text-brand-500 focus:ring-brand-500 cursor-pointer"
        />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center pointer-events-none">
          <button
            @click="deletePhoto(photo.id)"
            :disabled="deletingId === photo.id"
            class="opacity-0 group-hover:opacity-100 p-2 bg-white/90 hover:bg-red-500 hover:text-white rounded transition-all disabled:opacity-50 pointer-events-auto"
          >
            <UIcon :name="deletingId === photo.id ? 'i-lucide-loader-2' : 'i-lucide-trash-2'" class="text-base" :class="deletingId === photo.id ? 'animate-spin' : ''" />
          </button>
        </div>
        <div v-if="photo.status === 'pending' || photo.status === 'in-stages'" class="absolute top-1 right-1">
          <span class="px-1.5 py-0.5 bg-amber-100 text-amber-700 font-sans text-xs rounded">{{ photo.status }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="!uploading" class="text-center py-20">
      <p class="font-serif text-lg text-neutral-400">No photos yet.</p>
    </div>
  </div>
</template>
