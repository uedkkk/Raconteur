import { useDB, tables, desc } from '~~/server/utils/db'

export default eventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin privileges required',
    })
  }

  const db = useDB()

  const posts = db
    .select({
      id: tables.posts.id,
      title: tables.posts.title,
      slug: tables.posts.slug,
      status: tables.posts.status,
      excerpt: tables.posts.excerpt,
      createdAt: tables.posts.createdAt,
      updatedAt: tables.posts.updatedAt,
      publishedAt: tables.posts.publishedAt,
    })
    .from(tables.posts)
    .orderBy(desc(tables.posts.updatedAt))
    .all()

  return posts
})
