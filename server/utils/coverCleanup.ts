import { existsSync, readdirSync, statSync, unlinkSync } from 'node:fs'
import { resolve, join } from 'node:path'

const COVERS_DIR = resolve(process.cwd(), 'data/storage/covers')
const MAX_AGE_DAYS = 7

export function cleanupOldCovers(): { deleted: number; kept: number } {
  if (!existsSync(COVERS_DIR)) return { deleted: 0, kept: 0 }

  let deleted = 0
  let kept = 0
  const now = Date.now()
  const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000

  for (const file of readdirSync(COVERS_DIR)) {
    if (file === 'fallback.svg') {
      kept++
      continue
    }
    const filePath = join(COVERS_DIR, file)
    try {
      const stat = statSync(filePath)
      if (now - stat.mtimeMs > maxAgeMs) {
        unlinkSync(filePath)
        deleted++
      } else {
        kept++
      }
    } catch {
      kept++
    }
  }

  return { deleted, kept }
}
