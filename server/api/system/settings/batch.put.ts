import { z } from 'zod'
import {
  settingKeys,
  settingNamespaces,
} from '~~/server/services/settings/contants'
import { settingsManager } from '~~/server/services/settings/settingsManager'
import { useDB, tables, eq } from '~~/server/utils/db'

export default eventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin privileges required',
    })
  }

  const body = await readValidatedBody(
    event,
    z.object({
      updates: z.array(
        z.object({
          namespace: z.enum([...settingNamespaces]),
          key: z.enum([...settingKeys]),
          value: z.any(),
        }),
      ),
    }).parse,
  )

  try {
    let successCount = 0
    const errors: Array<{ namespace: string; key: string; error: string }> = []

    const db = useDB()
    const currentUser = session.user.id
      ? db
          .select()
          .from(tables.users)
          .where(eq(tables.users.id, session.user.id))
          .get()
      : null
    const updatedBy = currentUser ? currentUser.id : undefined

    for (const update of body.updates) {
      try {
        await settingsManager.set(
          update.namespace,
          update.key,
          update.value,
          updatedBy,
        )
        successCount++
      } catch (err) {
        errors.push({
          namespace: update.namespace,
          key: update.key,
          error: (err as Error).message,
        })
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        updated: successCount,
        errors,
      }
    }

    return {
      success: true,
      updated: successCount,
    }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: (error as Error).message || 'Failed to update settings',
    })
  }
})
