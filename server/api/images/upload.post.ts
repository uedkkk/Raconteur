import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { randomBytes } from 'node:crypto'

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

  const file = body[0]
  if (!file.data || !file.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file',
    })
  }

  const ext = file.filename.split('.').pop() || 'jpg'
  const id = randomBytes(8).toString('hex')
  const filename = `${id}.${ext}`

  const uploadDir = resolve(process.cwd(), 'data/storage/blog')
  await mkdir(uploadDir, { recursive: true })

  const filePath = join(uploadDir, filename)
  await writeFile(filePath, file.data)

  return { url: `/storage/blog/${filename}` }
})
