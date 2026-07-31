import { z } from 'zod'
import { useDB, tables, eq } from '~~/server/utils/db'
import { generateExcerpt } from '~~/shared/utils/markdown'
import GithubSlugger from 'github-slugger'

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
      title: z.string().min(1),
      content: z.string().optional().default(''),
      excerpt: z.string().optional(),
      status: z.enum(['draft', 'published']).optional().default('draft'),
    }).parse,
  )

  const db = useDB()

  const slugger = new GithubSlugger()
  let slug = slugger.slug(body.title)

  const existing = db
    .select()
    .from(tables.posts)
    .where(eq(tables.posts.slug, slug))
    .get()

  if (existing) {
    slug = slugger.slug(`${body.title}-${Date.now()}`)
  }

  const excerpt = body.excerpt || generateExcerpt(body.content)

  const now = new Date()

  const result = db
    .insert(tables.posts)
    .values({
      title: body.title,
      slug,
      content: body.content,
      excerpt,
      status: body.status,
      publishedAt: body.status === 'published' ? now : null,
    })
    .run()

  const post = db
    .select()
    .from(tables.posts)
    .where(eq(tables.posts.id, result.lastInsertRowid as number))
    .get()

  return post
})
