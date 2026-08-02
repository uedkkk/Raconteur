import { z } from 'zod'
import { storageConfigSchema } from '~~/shared/types/storage'
import { settingsManager } from '~~/server/services/settings/settingsManager'

export default eventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin privileges required' })
  }

  const body = await readValidatedBody(
    event,
    z.object({
      name: z.string().min(1),
      config: storageConfigSchema,
    }).parse,
  )

  const id = await settingsManager.storage.addProvider({
    name: body.name,
    provider: body.config.provider,
    config: body.config,
  })

  return { success: true, id }
})
