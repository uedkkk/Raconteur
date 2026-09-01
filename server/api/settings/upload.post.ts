import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { randomBytes } from 'node:crypto'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/gif']
const MAX_SIZE = 2 * 1024 * 1024

export default eventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin privileges required',
    })
  }

  const body = await readMultipartFormData(event)
  if (!body || body.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No file uploaded',
    })
  }

  const file = body.find((f) => f.name === 'file')
  if (!file || !file.data || !file.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file',
    })
  }

  if (file.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 413,
      statusMessage: 'File too large (max 2MB)',
    })
  }

  const contentType = file.type || ''
  if (contentType && !ALLOWED_TYPES.includes(contentType)) {
    throw createError({
      statusCode: 415,
      statusMessage: `Unsupported file type: ${contentType}`,
    })
  }

  const ext = file.filename.split('.').pop()?.toLowerCase() || 'png'
  const id = randomBytes(8).toString('hex')
  const filename = `${id}.${ext}`

  const uploadDir = resolve(process.cwd(), 'data/storage/settings')
  await mkdir(uploadDir, { recursive: true })

  const filePath = join(uploadDir, filename)
  await writeFile(filePath, file.data)

  return { url: `/storage/settings/${filename}` }
})
