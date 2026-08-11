import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const COVERS_DIR = resolve(process.cwd(), 'data/storage/covers')
const FALLBACK_COVER = '/storage/covers/fallback.svg'

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="#e5e5e5"/><text x="300" y="300" font-family="sans-serif" font-size="120" fill="#a3a3a3" text-anchor="middle" dominant-baseline="central">♪</text></svg>`

function ensureFallbackCover() {
  const filePath = join(COVERS_DIR, 'fallback.svg')
  if (!existsSync(filePath)) {
    mkdirSync(COVERS_DIR, { recursive: true })
    writeFileSync(filePath, FALLBACK_SVG)
  }
  return FALLBACK_COVER
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
}

function isMatch(itunesArtist: string, itunesTitle: string, expectedArtist: string, expectedTitle: string): boolean {
  const ia = normalize(itunesArtist)
  const it = normalize(itunesTitle)
  const ea = normalize(expectedArtist)
  const et = normalize(expectedTitle)
  if (!ia || !it || !ea || !et) return false
  if (ia.includes(ea) || ea.includes(ia)) {
    if (it.includes(et) || et.includes(it)) return true
  }
  return false
}

export async function fetchCoverFromItunes(title: string, artist: string): Promise<string> {
  if (!title || !artist) return ensureFallbackCover()
  try {
    const term = encodeURIComponent(`${artist} ${title}`)
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=5`,
      { signal: AbortSignal.timeout(10000) },
    )
    if (!res.ok) return ensureFallbackCover()
    const data: any = await res.json()
    const results: any[] = data?.results ?? []
    const match = results.find(
      (r) => isMatch(r.artistName, r.trackName, artist, title),
    )
    const artworkUrl: string | undefined = match?.artworkUrl100
    if (!artworkUrl) return ensureFallbackCover()
    return artworkUrl.replace('100x100', '600x600')
  } catch {
    return ensureFallbackCover()
  }
}
