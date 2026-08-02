import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

const STORAGE_DIR = resolve(process.cwd(), 'data/storage')

export default eventHandler(async (event) => {
  const { storageProvider } = useStorageProvider(event)
  const key = getRouterParam(event, 'key')

  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid key' })
  }

  let photo = await storageProvider.get(key)

  if (!photo) {
    try {
      const filePath = resolve(STORAGE_DIR, key)
      if (filePath.startsWith(STORAGE_DIR)) {
        photo = await readFile(filePath)
      }
    } catch {
      // File not found locally either
    }
  }

  if (!photo) {
    throw createError({ statusCode: 404, statusMessage: 'Photo not found' })
  }
  logger.chrono.info('Serve image from key', key)
  return photo
})
