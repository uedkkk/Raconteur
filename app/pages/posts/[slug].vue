<script setup lang="ts">
import { renderMarkdown } from '~~/shared/utils/markdown'

const route = useRoute()
const slug = route.params.slug as string

const { data: post, error } = await useFetch(`/api/posts/${slug}`)

if (error.value || !post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found',
  })
}

const appAuthor = useSettingRef('app:author')

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return renderMarkdown(post.value.content)
})

useHead({
  title: post.value.title,
})

const dayjs = useDayjs()
function formatDate(date: string | Date) {
  return dayjs(date).format('MMMM D, YYYY')
}
</script>

<template>
  <div v-if="post" class="mx-auto max-w-[900px] px-8 py-12">
    <header class="mb-10">
      <NuxtLink to="/" class="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-brand-500 no-underline">
        ← Posts
      </NuxtLink>
      <p class="font-display font-bold text-sm uppercase tracking-[0.05em] text-brand-500 mt-6 mb-3">
        {{ formatDate(post.publishedAt || post.createdAt) }}
      </p>
      <h1 class="font-display font-black text-[42px] leading-[1.05] tracking-[-0.025em] text-neutral-900 mb-3 font-opsz-144">
        {{ post.title }}
      </h1>
      <div class="font-sans text-sm text-neutral-500">
        <span v-if="appAuthor">{{ appAuthor }}</span>
      </div>
    </header>

    <div
      class="raconteur-content"
      v-html="renderedContent"
    />
  </div>
</template>

<style scoped>
.raconteur-content {
  font-family: var(--font-serif);
  font-size: 21px;
  line-height: 1.58;
  letter-spacing: -0.003em;
  color: rgba(0, 0, 0, 0.84);
}

.raconteur-content :deep(h1) {
  font-family: var(--font-sans);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-top: 56px;
  margin-bottom: -13px;
}

.raconteur-content :deep(h2) {
  font-family: var(--font-sans);
  font-size: 28px;
  font-weight: 700;
  line-height: 34.5px;
  letter-spacing: -0.014em;
  margin-top: 56px;
  margin-bottom: -13px;
}

.raconteur-content :deep(h3) {
  font-family: var(--font-sans);
  font-size: 22px;
  font-weight: 700;
  margin-top: 40px;
  margin-bottom: -8px;
}

.raconteur-content :deep(p) {
  margin-top: 21px;
}

.raconteur-content :deep(p:first-child) {
  margin-top: 0;
}

.raconteur-content :deep(p:first-child)::first-letter {
  font-family: var(--font-display);
  font-size: 42px;
  line-height: 42px;
  font-weight: 900;
  float: left;
  margin: 0 7px 0 -5px;
}

.raconteur-content :deep(blockquote) {
  font-family: var(--font-display);
  font-size: 18px;
  font-style: italic;
  font-weight: 500;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.68);
  border-left: none;
  padding-left: 50px;
  margin: 55px 0 33px 0;
}

.raconteur-content :deep(a) {
  color: var(--color-brand-500);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.raconteur-content :deep(a:hover) {
  color: var(--color-brand-600);
}

.raconteur-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 18px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  padding: 3px 5px;
}

.raconteur-content :deep(pre) {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 20px;
  overflow-x: auto;
  margin: 28px 0;
}

.raconteur-content :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 16px;
  line-height: 1.5;
}

.raconteur-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 28px 0;
}

.raconteur-content :deep(ul),
.raconteur-content :deep(ol) {
  margin-top: 21px;
  padding-left: 24px;
}

.raconteur-content :deep(li) {
  margin-top: 8px;
}

.raconteur-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin: 40px 0;
}

.raconteur-content :deep(strong) {
  font-weight: 700;
}

.raconteur-content :deep(em) {
  font-style: italic;
}
</style>
