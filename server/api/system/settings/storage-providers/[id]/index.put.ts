import { z } from 'zod'
import { storageConfigSchema } from '~~/shared/types/storage'
import { settingsManager } from '~~/server/services/settings/settingsManager'

export default eventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin privileges required' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

  const activeId = await settingsManager.get<number>('storage', 'provider')
  if (id === activeId) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot edit the active provider' })
  }

  const body = await readValidatedBody(
    event,
    z.object({
      name: z.string().min(1),
      config: storageConfigSchema,
    }).parse,
  )

  const existing = await settingsManager.storage.getProviderById(id)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Provider not found' })
  }

  let mergedConfig = body.config
  if (
    body.config.provider === 's3' &&
    existing.config.provider === 's3' &&
    !body.config.secretAccessKey
  ) {
    mergedConfig = {
      ...body.config,
      secretAccessKey: existing.config.secretAccessKey,
    }
  }

  await settingsManager.storage.updateProvider(id, {
    name: body.name,
    config: mergedConfig,
  })

  return { success: true }
})
