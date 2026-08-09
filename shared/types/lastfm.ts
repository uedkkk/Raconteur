export interface TopTrack {
  rank: number
  title: string
  artist: string
  cover: string
  playcount: number
  url: string
}

export type LastfmPeriod = '7day' | '1month' | '3month' | '6month' | '12month'

export const LASTFM_PERIOD_LABELS: Record<LastfmPeriod, string> = {
  '7day': 'Last 7 days',
  '1month': 'Last 30 days',
  '3month': 'Last 3 months',
  '6month': 'Last 6 months',
  '12month': 'Last 12 months',
}

export interface TopTracksResponse {
  period: LastfmPeriod
  profileUrl: string
  tracks: TopTrack[]
}
