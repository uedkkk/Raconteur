import { z } from 'zod'
import { settingsManager } from '~~/server/services/settings/settingsManager'
import { storageConfigSchema } from '~~/shared/types/storage'

export default eventHandler(async (event) => {
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

  await settingsManager.set('storage', 'provider', id)

  return { success: true, id }
})
