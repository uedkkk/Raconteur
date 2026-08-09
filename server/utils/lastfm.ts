import { settingsManager } from '~~/server/services/settings/settingsManager'
import type { LastfmPeriod, TopTrack } from '~~/shared/types/lastfm'

const API_BASE = 'https://ws.audioscrobbler.com/2.0/'

export interface LastfmConfig {
  apiKey: string
  user: string
  period: LastfmPeriod
}

export async function getLastfmConfig(): Promise<LastfmConfig> {
  const [apiKey, user, period] = await Promise.all([
    settingsManager.get<string>('lastfm', 'apiKey'),
    settingsManager.get<string>('lastfm', 'user'),
    settingsManager.get<string>('lastfm', 'period'),
  ])
  return {
    apiKey: apiKey || '',
    user: user || '',
    period: (period || '1month') as LastfmPeriod,
  }
}

function pickImage(images: any[]): string {
  if (!Array.isArray(images)) return ''
  for (const size of ['large', 'medium', 'extralarge']) {
    const img = images.find((i) => i?.size === size && i?.['#text'])
    if (img) return img['#text']
  }
  for (let i = images.length - 1; i >= 0; i--) {
    if (images[i]?.['#text']) return images[i]['#text']
  }
  return ''
}

export async function fetchLastfmTopTracks(
  apiKey: string,
  user: string,
  period: LastfmPeriod,
  limit: number,
): Promise<TopTrack[]> {
  if (!apiKey || !user) return []

  const params = new URLSearchParams({
    method: 'user.gettoptracks',
    user,
    api_key: apiKey,
    period,
    limit: String(limit),
    format: 'json',
  })

  const response = await fetch(`${API_BASE}?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Last.fm API error: ${response.status} ${response.statusText}`)
  }

  const data: any = await response.json()

  if (data?.error) {
    throw new Error(`Last.fm API error: ${data.error} ${data.message || ''}`.trim())
  }

  const tracks = data?.toptracks?.track
  if (!Array.isArray(tracks)) return []

  return tracks.map((t: any, i: number) => ({
    rank: Number(t?.['@attr']?.rank ?? t?.rank ?? i + 1),
    title: String(t?.name ?? ''),
    artist: String(t?.artist?.name ?? ''),
    cover: pickImage(t?.image),
    playcount: Number(t?.playcount ?? 0),
    url: String(t?.url ?? ''),
  }))
}
