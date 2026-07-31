import { useDB, tables, eq } from '~~/server/utils/db'

export default eventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin privileges required',
    })
  }

  const params = getRouterParams(event)
  const id = Number(params.id)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid post ID',
    })
  }

  const db = useDB()

  const existing = db
    .select()
    .from(tables.posts)
    .where(eq(tables.posts.id, id))
    .get()

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  db.delete(tables.posts)
    .where(eq(tables.posts.id, id))
    .run()

  return { success: true }
})
