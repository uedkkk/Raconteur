import { z } from 'zod'
import { settingsManager } from '~~/server/services/settings/settingsManager'
import { storageConfigSchema } from '~~/shared/types/storage'
import { useDB, tables, eq } from '~~/server/utils/db'

export default eventHandler(async (event) => {
  const body = await readValidatedBody(
    event,
    z.object({
      admin: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        username: z.string().min(2).default('admin'),
      }),
      site: z.object({
        title: z.string().min(1),
        slogan: z.string().optional(),
        avatarUrl: z.string().optional(),
        author: z.string().optional(),
      }),
      storage: z.object({
        name: z.string().min(1),
        config: storageConfigSchema,
      }),
    }).parse,
  )

  const db = useDB()

  let adminUser: typeof tables.users.$inferSelect | undefined
  const existingUser = db.select().from(tables.users).limit(1).get()
  if (existingUser) {
    if (existingUser.email === body.admin.email) {
      await db
        .update(tables.users)
        .set({
          password: await hashPassword(body.admin.password),
          username: body.admin.username,
          isAdmin: 1,
        })
        .where(eq(tables.users.id, existingUser.id))
        .run()
      adminUser = db.select().from(tables.users).where(eq(tables.users.id, existingUser.id)).get()
    } else {
      throw createError({ statusCode: 400, message: 'User already exists' })
    }
  } else {
    await db
      .insert(tables.users)
      .values({
        email: body.admin.email,
        username: body.admin.username,
        password: await hashPassword(body.admin.password),
        isAdmin: 1,
        createdAt: new Date(),
      })
      .run()
    adminUser = db.select().from(tables.users).where(eq(tables.users.email, body.admin.email)).get()
  }

  await settingsManager.set('app', 'title', body.site.title)
  if (body.site.slogan) await settingsManager.set('app', 'slogan', body.site.slogan)
  if (body.site.avatarUrl) await settingsManager.set('app', 'avatarUrl', body.site.avatarUrl)
  if (body.site.author) await settingsManager.set('app', 'author', body.site.author)

  const id = await settingsManager.storage.addProvider({
    name: body.storage.name,
    provider: body.storage.config.provider,
    config: body.storage.config,
  })
  await settingsManager.set('storage', 'provider', id)

  await settingsManager.set('system', 'firstLaunch', false, undefined, true)

  if (adminUser) {
    await setUserSession(event, { user: adminUser }, { cookie: { secure: false } })
  }

  return { success: true }
})
