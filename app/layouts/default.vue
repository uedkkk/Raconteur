<script setup lang="ts">
const appTitle = useSettingRef('app:title')
const appSlogan = useSettingRef('app:slogan')
const route = useRoute()

const navItems = [
  { label: 'Photographs', to: '/#photographs' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

function handleNavClick(e: MouseEvent, to: string) {
  if (!to.includes('#')) return
  const hash = to.split('#')[1]
  if (route.path !== '/') return
  e.preventDefault()
  const el = document.getElementById(hash)
  if (!el) return
  const start = window.scrollY
  const target = el.getBoundingClientRect().top + start
  const duration = 1000
  const startTime = performance.now()
  function step(now: number) {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    window.scrollTo(0, start + (target - start) * eased)
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
</script>

<template>
  <div class="min-h-screen bg-[#FAFAFA] flex flex-col">
    <header class="border-b-4 border-neutral-900">
      <div class="mx-auto max-w-[900px] px-8">
        <div class="flex items-end justify-between py-10 pb-4">
          <div>
            <h1 class="font-display font-black text-[44px] leading-[0.9] tracking-[-0.03em] text-neutral-900 font-opsz-144">
              <NuxtLink to="/" class="no-underline text-neutral-900">{{ appTitle || 'Raconteur' }}</NuxtLink>
            </h1>
            <p v-if="appSlogan" class="font-serif italic text-[15px] text-neutral-500 mt-1 ml-0.5">
              {{ appSlogan }}
            </p>
          </div>
          <nav class="flex">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              @click="handleNavClick($event, item.to)"
              class="font-sans text-[13px] font-semibold uppercase tracking-[0.08em] no-underline px-[18px] py-2 border-b-3 transition-colors"
              :class="isActive(item.to)
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-900 hover:border-brand-500 hover:text-brand-500'"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t-4 border-neutral-900">
      <div class="mx-auto max-w-[900px] px-8 py-7 flex justify-between">
        <span class="font-sans text-xs font-medium uppercase tracking-[0.08em] text-neutral-500">
          {{ appTitle || 'Raconteur' }}
        </span>
        <span class="font-sans text-xs font-medium uppercase tracking-[0.08em] text-neutral-500">
          {{ appSlogan || 'Stories and photographs, collected slowly.' }}
        </span>
      </div>
    </footer>
  </div>
</template>
