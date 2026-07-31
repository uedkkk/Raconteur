import { useDB, tables, eq, or, and } from '~~/server/utils/db'

export default eventHandler(async () => {
  const db = useDB()

  const allSettings = db
    .select()
    .from(tables.settings)
    .where(
      or(
        eq(tables.settings.isPublic, true),
        and(
          eq(tables.settings.namespace, 'system'),
          eq(tables.settings.key, 'firstLaunch'),
        ),
      ),
    )
    .all()

  const grouped: Record<string, Record<string, any>> = {}

  for (const setting of allSettings) {
    if (!grouped[setting.namespace]) {
      grouped[setting.namespace] = {}
    }

    let value: any = setting.value
    try {
      if (setting.type === 'json') {
        value = setting.value ? JSON.parse(setting.value) : null
      } else if (setting.type === 'number') {
        value = setting.value ? Number(setting.value) : null
      } else if (setting.type === 'boolean') {
        value = setting.value === 'true' || setting.value === '1'
      }
    } catch {
      // keep raw value
    }

    grouped[setting.namespace][setting.key] = value
  }

  return {
    timestamp: Date.now(),
    data: grouped,
  }
})
