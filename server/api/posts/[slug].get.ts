import { useDB, tables, eq } from '~~/server/utils/db'

export default eventHandler(async (event) => {
  const path = event.path || ''
  const slug = decodeURIComponent(path.split('/').pop() || '')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    })
  }

  const db = useDB()

  const post = db
    .select()
    .from(tables.posts)
    .where(eq(tables.posts.slug, slug))
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
