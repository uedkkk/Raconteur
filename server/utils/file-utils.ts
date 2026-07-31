import crypto from 'crypto'
import path from 'path'

export const sanitizeFileName = (
  fileName: string,
  options: {
    maxLength?: number
    fallbackPrefix?: string
    minLength?: number
  } = {},
): string => {
  const { maxLength = 50, fallbackPrefix = 'file', minLength = 3 } = options

  const cleanedName = fileName
    .replace(/[^\w\-_.]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')

  if (cleanedName.length < minLength) {
    const hash = crypto.createHash('md5').update(fileName).digest('hex')
    return `${fallbackPrefix}_${hash.substring(0, 8)}`
  }

  if (cleanedName.length > maxLength) {
    const hash = crypto.createHash('md5').update(fileName).digest('hex')
    const truncateLength = maxLength - 9
    return `${cleanedName.substring(0, truncateLength)}_${hash.substring(0, 8)}`
  }

  return cleanedName
}

export const generateSafePhotoId = (s3key: string): string => {
  const baseName = path.basename(s3key, path.extname(s3key))
  return sanitizeFileName(baseName, {
    maxLength: 32,
    fallbackPrefix: 'photo',
    minLength: 3,
  })
}

export const generateSafeFileKey = (
  s3key: string,
  newExtension: string,
): string => {
  const baseName = path.basename(s3key, path.extname(s3key))
  const dirName = path.dirname(s3key)
  const safeName = sanitizeFileName(baseName, {
    maxLength: 100,
    fallbackPrefix: 'file',
    minLength: 1,
  })

  if (dirName === '.' || dirName === '') {
    return `${safeName}${newExtension}`
  }

  return `${dirName}/${safeName}${newExtension}`
}
