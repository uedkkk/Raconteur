import { z } from 'zod'
import { useDB, tables, eq } from '~~/server/utils/db'

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    z.object({
      slug: z.string().min(1),
    }).parse,
  )

  const db = useDB()

  const post = db
    .select()
    .from(tables.posts)
    .where(eq(tables.posts.slug, query.slug))
    .get()

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  if (post.status === 'draft') {
    const session = await requireUserSession(event)
    if (!session || !session.user.isAdmin) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found',
      })
    }
  }

  return post
})
