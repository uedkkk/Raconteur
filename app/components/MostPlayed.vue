<script setup lang="ts">
import type { TopTracksResponse, TopTrack, LastfmPeriod } from '~~/shared/types/lastfm'
import { LASTFM_PERIOD_LABELS } from '~~/shared/types/lastfm'

const { data } = await useFetch<TopTracksResponse>('/api/toptracks', {
  default: () => ({
    period: '1month' as LastfmPeriod,
    profileUrl: '',
    tracks: [] as TopTrack[],
  }),
})

const tracks = computed(() => data.value?.tracks ?? [])
const periodLabel = computed(() => {
  const p = data.value?.period
  return p ? LASTFM_PERIOD_LABELS[p] : ''
})
const profileUrl = computed(() => data.value?.profileUrl ?? '')
</script>

<template>
  <section v-if="tracks.length > 0" class="pt-14">
    <div class="flex justify-between items-baseline mb-6 pb-3 border-b-4 border-neutral-900">
      <h3 class="font-display font-black text-2xl tracking-[-0.02em]">Most Played</h3>
      <a
        v-if="profileUrl"
        :href="profileUrl"
        target="_blank"
        rel="noopener"
        class="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-brand-500 no-underline hover:text-brand-600 transition-colors"
      >
        via Last.fm · {{ periodLabel }} →
      </a>
      <span v-else class="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-brand-500">
        via Last.fm · {{ periodLabel }}
      </span>
    </div>

    <div>
      <a
        v-for="track in tracks"
        :key="track.rank"
        :href="track.url || '#'"
        target="_blank"
        rel="noopener"
        class="grid grid-cols-[44px_56px_1fr] gap-4 items-center border-t border-neutral-200 py-4 no-underline group"
      >
        <div class="font-display font-bold text-[22px] leading-none text-neutral-300 font-variant-numeric-tabular-nums group-hover:text-brand-500 transition-colors">
          {{ String(track.rank).padStart(2, '0') }}
        </div>
        <img
          v-if="track.cover"
          :src="track.cover"
          :alt="track.title"
          class="w-14 h-14 object-cover"
          loading="lazy"
        />
        <div v-else class="w-14 h-14 bg-neutral-100" />
        <div class="min-w-0">
          <div class="flex items-baseline gap-3">
            <span class="font-display font-semibold text-[17px] leading-tight tracking-[-0.01em] text-neutral-900 group-hover:text-brand-500 transition-colors truncate">
              {{ track.title }}
            </span>
            <span class="ml-auto font-sans text-xs text-neutral-500 whitespace-nowrap font-variant-numeric-tabular-nums">
              {{ track.playcount }} plays
            </span>
          </div>
          <div class="font-serif text-sm text-neutral-500 mt-0.5 truncate">
            {{ track.artist }}
          </div>
        </div>
      </a>
    </div>
  </section>
</template>
