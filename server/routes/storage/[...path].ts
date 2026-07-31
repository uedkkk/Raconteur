import { createReadStream, statSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const STORAGE_DIR = resolve(process.cwd(), 'data/storage')

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
}

export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path')
  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }

  const filePath = resolve(STORAGE_DIR, path)

  if (!filePath.startsWith(STORAGE_DIR)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  const stat = statSync(filePath)
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  setResponseHeaders(event, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Cache-Control': 'public, max-age=31536000, immutable',
  })

  return sendStream(event, createReadStream(filePath))
})
