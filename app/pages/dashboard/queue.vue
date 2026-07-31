<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const statusFilter = ref<string>('')

const { data: stats, refresh: refreshStats } = await useFetch('/api/queue/stats')
const { data: taskData, refresh: refreshTasks } = await useFetch('/api/queue/task/list', {
  query: computed(() => statusFilter.value ? { status: statusFilter.value } : {}),
})

const tasks = computed(() => taskData.value?.data || [])

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'in-stages' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

const statusColors: Record<string, string> = {
  pending: 'bg-neutral-100 text-neutral-600',
  'in-stages': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  pollTimer = setInterval(() => {
    refreshStats()
    refreshTasks()
  }, 5000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

async function retryTask(taskId: number) {
  try {
    await $fetch('/api/queue/task/retry', {
      method: 'POST',
      body: { taskId },
    })
    await refreshTasks()
  } catch (e) {
    console.error('Failed to retry task:', e)
  }
}

async function clearCompleted() {
  if (!confirm('Clear all completed tasks?')) return
  try {
    await $fetch('/api/queue/task/clear', { method: 'DELETE' })
    await Promise.all([refreshStats(), refreshTasks()])
  } catch (e) {
    console.error('Failed to clear tasks:', e)
  }
}

const formatTime = (ts: string | null) => {
  if (!ts) return '—'
  return useDayjs()(ts).format('MMM D, HH:mm:ss')
}

const parsePayload = (payload: string) => {
  try {
    return JSON.parse(payload)
  } catch {
    return {}
  }
}
</script>

<template>
  <div class="p-8 max-w-5xl">
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-2xl font-bold text-neutral-900">Queue Monitor</h1>
      <button
        @click="clearCompleted"
        class="px-3 py-1.5 font-sans text-sm text-neutral-600 hover:text-red-500 transition-colors"
      >
        Clear Completed
      </button>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="p-4 bg-white border border-neutral-200 rounded">
        <p class="font-sans text-xs text-neutral-400 uppercase mb-1">Workers</p>
        <p class="font-display text-xl font-bold text-neutral-900">{{ stats?.pool?.workerCount || 0 }}</p>
      </div>
      <div class="p-4 bg-white border border-neutral-200 rounded">
        <p class="font-sans text-xs text-neutral-400 uppercase mb-1">Pending</p>
        <p class="font-display text-xl font-bold text-neutral-900">{{ stats?.queue?.pending || 0 }}</p>
      </div>
      <div class="p-4 bg-white border border-neutral-200 rounded">
        <p class="font-sans text-xs text-neutral-400 uppercase mb-1">Processing</p>
        <p class="font-display text-xl font-bold text-neutral-900">{{ stats?.queue?.processing || 0 }}</p>
      </div>
      <div class="p-4 bg-white border border-neutral-200 rounded">
        <p class="font-sans text-xs text-neutral-400 uppercase mb-1">Failed</p>
        <p class="font-display text-xl font-bold text-red-500">{{ stats?.queue?.failed || 0 }}</p>
      </div>
    </div>

    <div class="flex gap-2 mb-4">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        @click="statusFilter = opt.value"
        class="px-3 py-1.5 font-sans text-sm rounded transition-colors"
        :class="statusFilter === opt.value ? 'bg-brand-500 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="tasks.length > 0" class="bg-white border border-neutral-200 rounded overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-neutral-200 bg-neutral-50">
            <th class="text-left px-4 py-3 font-sans text-xs font-medium text-neutral-400 uppercase">ID</th>
            <th class="text-left px-4 py-3 font-sans text-xs font-medium text-neutral-400 uppercase">Type</th>
            <th class="text-left px-4 py-3 font-sans text-xs font-medium text-neutral-400 uppercase">Status</th>
            <th class="text-left px-4 py-3 font-sans text-xs font-medium text-neutral-400 uppercase">Stage</th>
            <th class="text-left px-4 py-3 font-sans text-xs font-medium text-neutral-400 uppercase">Created</th>
            <th class="text-right px-4 py-3 font-sans text-xs font-medium text-neutral-400 uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task.id" class="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
            <td class="px-4 py-3 font-mono text-sm text-neutral-500">{{ task.id }}</td>
            <td class="px-4 py-3 font-sans text-sm text-neutral-900">{{ parsePayload(task.payload)?.type || '—' }}</td>
            <td class="px-4 py-3">
              <span class="font-sans text-xs px-2 py-0.5 rounded" :class="statusColors[task.status] || 'bg-neutral-100'">
                {{ task.status }}
              </span>
            </td>
            <td class="px-4 py-3 font-sans text-sm text-neutral-500">{{ task.statusStage || '—' }}</td>
            <td class="px-4 py-3 font-sans text-sm text-neutral-400">{{ formatTime(task.createdAt) }}</td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="task.status === 'failed'"
                @click="retryTask(task.id)"
                class="px-2 py-1 font-sans text-xs text-brand-600 hover:text-brand-700 transition-colors"
              >
                Retry
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-20">
      <p class="font-serif text-lg text-neutral-400">No tasks in queue.</p>
    </div>
  </div>
</template>
