import path from 'path'
import { eq } from 'drizzle-orm'
import { generateSafePhotoId } from '~~/server/utils/file-utils'
import { useStorageProvider } from '~~/server/utils/useStorageProvider'

const IMAGE_EXTENSIONS = new Set([
  '.avif',
  '.bmp',
  '.gif',
  '.heic',
  '.heif',
  '.jpeg',
  '.jpg',
  '.png',
  '.tif',
  '.tiff',
  '.webp',
])

const isImageFile = (key: string): boolean => {
  const ext = path.extname(key).toLowerCase()
  return ext !== '' && IMAGE_EXTENSIONS.has(ext)
}

const isThumbnail = (key: string): boolean => {
  return key.includes('thumbnails/') || key.includes('thumbnail/')
}

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { storageProvider } = useStorageProvider(event)

  let allObjects
  try {
    allObjects = await storageProvider.listImages()
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to list images: ${e?.message || 'Unknown error'}`,
    })
  }

  const imageFiles = allObjects.filter(
    (obj) => isImageFile(obj.key) && !isThumbnail(obj.key),
  )

  if (imageFiles.length === 0) {
    return {
      totalFound: 0,
      alreadyExists: 0,
      newQueued: 0,
      failed: 0,
      results: [],
    }
  }

  const db = useDB()
  const existingIds = new Set<string>()

  for (const img of imageFiles) {
    const photoId = generateSafePhotoId(img.key)
    const existing = await db
      .select({ id: tables.photos.id })
      .from(tables.photos)
      .where(eq(tables.photos.id, photoId))
      .get()

    if (existing) {
      existingIds.add(photoId)
    }
  }

  const workerPool = globalThis.__workerPool
  if (!workerPool) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Worker pool not initialized',
    })
  }

  const newImages = imageFiles.filter(
    (img) => !existingIds.has(generateSafePhotoId(img.key)),
  )

  const results: Array<{
    key: string
    taskId?: number
    success: boolean
    error?: string
  }> = []

  for (const img of newImages) {
    try {
      const taskId = await workerPool.addTask(
        { type: 'photo', storageKey: img.key },
        { priority: 0, maxAttempts: 3 },
      )
      results.push({ key: img.key, taskId, success: true })
    } catch (error: any) {
      results.push({
        key: img.key,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return {
    totalFound: imageFiles.length,
    alreadyExists: existingIds.size,
    newQueued: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  }
})
