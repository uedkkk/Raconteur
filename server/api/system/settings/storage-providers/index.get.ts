import { settingsManager } from '~~/server/services/settings/settingsManager'

export default eventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin privileges required' })
  }

  const providers = await settingsManager.storage.getProviders()
  const activeId = await settingsManager.get<number>('storage', 'provider')

  return {
    providers: providers.map((p) => ({
      id: p.id,
      name: p.name,
      provider: p.provider,
      isActive: p.id === activeId,
      createdAt: p.createdAt,
      config: p.config,
    })),
    activeId,
  }
})
