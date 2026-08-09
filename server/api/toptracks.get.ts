import { getLastfmConfig, fetchLastfmTopTracks } from '~~/server/utils/lastfm'
import type { LastfmPeriod, TopTrack, TopTracksResponse } from '~~/shared/types/lastfm'

const LIMIT = 5
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

let cache: { period: LastfmPeriod; profileUrl: string; tracks: TopTrack[]; ts: number } | null = null

export default eventHandler(async () => {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return { period: cache.period, profileUrl: cache.profileUrl, tracks: cache.tracks } satisfies TopTracksResponse
  }

  const config = await getLastfmConfig()
  const profileUrl = config.user
    ? `https://www.last.fm/user/${encodeURIComponent(config.user)}`
    : ''

  if (!config.apiKey || !config.user) {
    return { period: config.period, profileUrl, tracks: [] } satisfies TopTracksResponse
  }

  try {
    const tracks = await fetchLastfmTopTracks(
      config.apiKey,
      config.user,
      config.period,
      LIMIT,
    )
    cache = { period: config.period, profileUrl, tracks, ts: Date.now() }
    return { period: config.period, profileUrl, tracks } satisfies TopTracksResponse
  } catch (err: any) {
    logger.dynamic('lastfm').warn('Failed to fetch Last.fm top tracks:', err?.message)
    return {
      period: config.period,
      profileUrl,
      tracks: cache?.tracks ?? [],
    } satisfies TopTracksResponse
  }
})
