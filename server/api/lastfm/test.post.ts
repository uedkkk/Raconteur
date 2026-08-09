import { z } from 'zod'
import { getLastfmConfig, fetchLastfmTopTracks } from '~~/server/utils/lastfm'

export default eventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (!session || !session.user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Admin privileges required' })
  }

  const body = await readValidatedBody(
    event,
    z
      .object({
        apiKey: z.string().optional(),
        user: z.string().optional(),
      })
      .parse,
  )

  const saved = await getLastfmConfig()
  const apiKey = body.apiKey || saved.apiKey
  const user = body.user || saved.user

  if (!apiKey || !user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing Last.fm API key or username',
    })
  }

  try {
    const tracks = await fetchLastfmTopTracks(apiKey, user, saved.period, 1)
    return {
      ok: true,
      sample: tracks[0]?.title ?? null,
    }
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: err?.message || 'Failed to reach Last.fm',
    })
  }
})
