<script setup lang="ts">
import { renderMarkdown } from '~~/shared/utils/markdown'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const previewRef = ref<HTMLDivElement | null>(null)

const content = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const renderedPreview = computed(() => renderMarkdown(content.value))

function insertText(before: string, after = '', placeholder = '') {
  const ta = textareaRef.value
  if (!ta) return

  const start = ta.selectionStart
  const end = ta.selectionEnd
  const selected = content.value.substring(start, end) || placeholder
  const newText =
    content.value.substring(0, start) +
    before +
    selected +
    after +
    content.value.substring(end)

  content.value = newText

  nextTick(() => {
    ta.focus()
    ta.setSelectionRange(start + before.length, start + before.length + selected.length)
  })
}

function insertLine(prefix: string) {
  const ta = textareaRef.value
  if (!ta) return

  const start = ta.selectionStart
  const lineStart = content.value.lastIndexOf('\n', start - 1) + 1
  const newText =
    content.value.substring(0, lineStart) +
    prefix +
    content.value.substring(lineStart)

  content.value = newText

  nextTick(() => {
    ta.focus()
    ta.setSelectionRange(start + prefix.length, start + prefix.length)
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'b':
        e.preventDefault()
        insertText('**', '**', 'bold')
        break
      case 'i':
        e.preventDefault()
        insertText('*', '*', 'italic')
        break
      case 'k':
        e.preventDefault()
        insertText('[', '](url)', 'link text')
        break
      case '`':
        e.preventDefault()
        insertText('`', '`', 'code')
        break
    }
  }

  if (e.key === 'Tab') {
    e.preventDefault()
    insertText('  ')
  }
}

async function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (!file) continue
      await uploadImage(file)
      return
    }
  }
}

async function handleDrop(e: DragEvent) {
  if (!e.dataTransfer?.files) return
  for (const file of e.dataTransfer.files) {
    if (file.type.startsWith('image/')) {
      e.preventDefault()
      await uploadImage(file)
    }
  }
}

async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const result = await $fetch<{ url: string }>('/api/images/upload', {
      method: 'POST',
      body: formData,
    })

    const ta = textareaRef.value
    if (!ta) return

    const markdown = `![${file.name}](${result.url})\n`
    const start = ta.selectionStart
    content.value =
      content.value.substring(0, start) +
      markdown +
      content.value.substring(ta.selectionEnd)

    nextTick(() => {
      ta.focus()
      ta.setSelectionRange(start + markdown.length, start + markdown.length)
    })
  } catch (error) {
    console.error('Failed to upload image:', error)
  }
}

function syncScroll() {
  const ta = textareaRef.value
  const pv = previewRef.value
  if (!ta || !pv) return

  const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight)
  pv.scrollTop = ratio * (pv.scrollHeight - pv.clientHeight)
}

const toolbarButtons = [
  { label: 'B', action: () => insertText('**', '**', 'bold'), title: 'Bold (Ctrl+B)' },
  { label: 'I', action: () => insertText('*', '*', 'italic'), title: 'Italic (Ctrl+I)' },
  { label: 'H', action: () => insertLine('## '), title: 'Heading' },
  { label: '\u201C', action: () => insertLine('> '), title: 'Quote' },
  { label: '<>', action: () => insertText('`', '`', 'code'), title: 'Code (Ctrl+`)' },
  { label: '\u2022', action: () => insertLine('- '), title: 'List' },
  { label: '1.', action: () => insertLine('1. '), title: 'Numbered list' },
  { label: '\uD83D\uDD17', action: () => insertText('[', '](url)', 'link text'), title: 'Link (Ctrl+K)' },
]
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center gap-1 px-3 py-2 border-b border-neutral-200 bg-neutral-50">
      <button
        v-for="btn in toolbarButtons"
        :key="btn.label"
        @click="btn.action"
        :title="btn.title"
        class="w-8 h-8 flex items-center justify-center rounded text-sm font-mono text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
      >
        {{ btn.label }}
      </button>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div
        ref="previewRef"
        class="w-1/2 p-4 overflow-y-auto bg-white border-r border-neutral-200 custom-scrollbar"
      >
        <div
          v-if="content"
          class="raconteur-content"
          v-html="renderedPreview"
        />
        <div v-else class="text-neutral-300 font-serif text-lg">
          Preview will appear here...
        </div>
      </div>

      <textarea
        ref="textareaRef"
        v-model="content"
        @keydown="handleKeydown"
        @paste="handlePaste"
        @drop="handleDrop"
        @dragover.prevent
        @scroll="syncScroll"
        class="w-1/2 p-4 font-mono text-sm leading-relaxed text-neutral-800 bg-white resize-none outline-none custom-scrollbar"
        placeholder="Write your story in Markdown..."
        spellcheck="false"
      />
    </div>
  </div>
</template>

<style scoped>
.raconteur-content {
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.58;
  color: rgba(0, 0, 0, 0.84);
}

.raconteur-content :deep(h1) {
  font-family: var(--font-sans);
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-top: 28px;
  margin-bottom: -6px;
}

.raconteur-content :deep(h2) {
  font-family: var(--font-sans);
  font-size: 22px;
  font-weight: 700;
  margin-top: 28px;
  margin-bottom: -6px;
}

.raconteur-content :deep(h3) {
  font-family: var(--font-sans);
  font-size: 18px;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: -4px;
}

.raconteur-content :deep(p) {
  margin-top: 16px;
}

.raconteur-content :deep(p:first-child) {
  margin-top: 0;
}

.raconteur-content :deep(blockquote) {
  font-family: var(--font-display);
  font-size: 18px;
  font-style: italic;
  font-weight: 500;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.68);
  border-left: none;
  padding-left: 30px;
  margin: 28px 0;
}

.raconteur-content :deep(a) {
  color: var(--color-brand-600);
  text-decoration: underline;
}

.raconteur-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 15px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  padding: 2px 4px;
}

.raconteur-content :deep(pre) {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  padding: 14px;
  overflow-x: auto;
  margin: 16px 0;
}

.raconteur-content :deep(pre code) {
  background: none;
  padding: 0;
}

.raconteur-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
  margin: 16px 0;
}

.raconteur-content :deep(ul),
.raconteur-content :deep(ol) {
  margin-top: 16px;
  padding-left: 20px;
}

.raconteur-content :deep(li) {
  margin-top: 4px;
}

.raconteur-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin: 24px 0;
}
</style>
