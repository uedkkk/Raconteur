import { settingsManager } from '~~/server/services/settings/settingsManager'

export default eventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin privileges required' })
  }

  const id = Number(getRouterParam(event, 'id') || getQuery(event).id)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

  const activeId = await settingsManager.get<number>('storage', 'provider')
  if (id === activeId) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete the active provider' })
  }

  await settingsManager.storage.deleteProvider(id)

  return { success: true }
})
