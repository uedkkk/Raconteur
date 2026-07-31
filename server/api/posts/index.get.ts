import { useDB, tables, eq, desc } from '~~/server/utils/db'

export default eventHandler(async () => {
  const db = useDB()

  const posts = db
    .select({
      id: tables.posts.id,
      title: tables.posts.title,
      slug: tables.posts.slug,
      excerpt: tables.posts.excerpt,
      createdAt: tables.posts.createdAt,
      publishedAt: tables.posts.publishedAt,
    })
    .from(tables.posts)
    .where(eq(tables.posts.status, 'published'))
    .orderBy(desc(tables.posts.publishedAt))
    .all()

  return posts
})
