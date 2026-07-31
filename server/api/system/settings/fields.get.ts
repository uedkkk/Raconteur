import { z } from 'zod'
import { settingsManager } from '~~/server/services/settings/settingsManager'
import { DEFAULT_SETTINGS } from '~~/server/services/settings/contants'
import { getSettingUIConfig } from '~~/server/services/settings/ui-config'
import type { SettingsFieldsResponse } from '~~/shared/types/settings'

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    z.object({
      namespace: z.string().min(1),
    }).parse,
  )

  const session = await requireUserSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin privileges required',
    })
  }

  try {
    const schema = await settingsManager.getSchema()
    const allowedKeys = new Set(
      DEFAULT_SETTINGS.filter((s) => s.namespace === query.namespace).map(
        (s) => s.key,
      ),
    )
    const namespaceSettings = schema.filter(
      (s) => s.namespace === query.namespace && allowedKeys.has(s.key),
    )

    if (namespaceSettings.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Namespace ${query.namespace} not found`,
      })
    }

    const fields = namespaceSettings.map((setting) => {
      const uiConfig = getSettingUIConfig(query.namespace, setting.key)
      return {
        ...setting,
        ui: uiConfig || {
          type: 'input' as const,
          required: false,
        },
      }
    })

    const response: SettingsFieldsResponse = {
      namespace: query.namespace,
      fields,
    }

    return response
  } catch (error) {
    if ((error as any).statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage:
        (error as Error).message || 'Failed to fetch settings fields',
    })
  }
})
