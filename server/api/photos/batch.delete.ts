import { inArray } from 'drizzle-orm'

const HEIC_EXTENSIONS = ['.heic', '.heif', '.hif']

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const { storageProvider } = useStorageProvider(event)

  const body = await readBody(event)
  const ids: string[] = body?.ids

  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Photo IDs are required' })
  }

  const db = useDB()
  const photos = db
    .select()
    .from(tables.photos)
    .where(inArray(tables.photos.id, ids))
    .all()

  let deleted = 0
  let failed = 0

  for (const photo of photos) {
    try {
      if (photo.storageKey) {
        try {
          await storageProvider.delete(photo.storageKey)
          const lowerStorageKey = photo.storageKey.toLowerCase()
          const heicExtension = HEIC_EXTENSIONS.find((ext) =>
            lowerStorageKey.endsWith(ext),
          )
          if (heicExtension) {
            const jpegKey =
              photo.storageKey.slice(
                0,
                photo.storageKey.length - heicExtension.length,
              ) + '.jpeg'
            if (jpegKey !== photo.storageKey) {
              try { await storageProvider.delete(jpegKey) } catch {}
            }
          }
          if (photo.thumbnailKey) {
            await storageProvider.delete(photo.thumbnailKey)
          }
          if (photo.livePhotoVideoKey) {
            await storageProvider.delete(photo.livePhotoVideoKey)
          }
        } catch {}
      }

      db.delete(tables.photos).where(eq(tables.photos.id, photo.id)).run()
      deleted++
    } catch {
      failed++
    }
  }

  return { success: true, deleted, failed, total: photos.length }
})
