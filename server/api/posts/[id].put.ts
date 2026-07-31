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

  const params = getRouterParams(event)
  const id = Number(params.id)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid post ID',
    })
  }

  const body = await readValidatedBody(
    event,
    z.object({
      title: z.string().min(1).optional(),
      content: z.string().optional(),
      excerpt: z.string().optional(),
      status: z.enum(['draft', 'published']).optional(),
    }).parse,
  )

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

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  }

  if (body.title !== undefined && body.title !== existing.title) {
    updates.title = body.title
    const slugger = new GithubSlugger()
    updates.slug = slugger.slug(body.title)

    const slugExists = db
      .select()
      .from(tables.posts)
      .where(eq(tables.posts.slug, updates.slug))
      .get()

    if (slugExists && slugExists.id !== id) {
      updates.slug = slugger.slug(`${body.title}-${Date.now()}`)
    }
  }

  if (body.content !== undefined) {
    updates.content = body.content
    if (!body.excerpt) {
      updates.excerpt = generateExcerpt(body.content)
    }
  }

  if (body.excerpt !== undefined) {
    updates.excerpt = body.excerpt
  }

  if (body.status !== undefined) {
    updates.status = body.status
    if (body.status === 'published' && !existing.publishedAt) {
      updates.publishedAt = new Date()
    }
  }

  db.update(tables.posts)
    .set(updates)
    .where(eq(tables.posts.id, id))
    .run()

  const post = db
    .select()
    .from(tables.posts)
    .where(eq(tables.posts.id, id))
    .get()

  return post
})
