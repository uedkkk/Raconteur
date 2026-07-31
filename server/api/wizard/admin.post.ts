import { z } from 'zod'

export default eventHandler(async (event) => {
  const db = useDB()
  const { email, password, username } = await readValidatedBody(
    event,
    z.object({
      email: z.email(),
      password: z.string().min(6),
      username: z.string().min(2).default('admin'),
    }).parse,
  )

  const existingUser = db.select().from(tables.users).limit(1).get()
  if (existingUser) {
    if (existingUser.email === email) {
      await db
        .update(tables.users)
        .set({
          password: await hashPassword(password),
          username,
          isAdmin: 1,
        })
        .where(eq(tables.users.id, existingUser.id))
        .run()
      return { success: true }
    }

    throw createError({
      statusCode: 400,
      message: 'User already exists',
    })
  }

  await db
    .insert(tables.users)
    .values({
      email,
      username,
      password: await hashPassword(password),
      isAdmin: 1,
      createdAt: new Date(),
    })
    .run()

  return { success: true }
})
