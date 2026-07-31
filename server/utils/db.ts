import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

import * as schema from '../database/schema'

export const tables = schema
export { eq, and, or, inArray, desc, asc, ne, not, sql } from 'drizzle-orm'

let dbInstance: ReturnType<typeof drizzle> | null = null
let sqliteInstance: Database.Database | null = null

export function useDB() {
  if (!dbInstance || !sqliteInstance) {
    sqliteInstance = new Database('data/app.sqlite3', {
      verbose:
        process.env.NODE_ENV === 'development'
          ? logger.dynamic('db').verbose
          : undefined,
    })

    sqliteInstance.pragma('journal_mode = WAL')
    sqliteInstance.pragma('synchronous = NORMAL')
    sqliteInstance.pragma('cache_size = 1000')
    sqliteInstance.pragma('temp_store = MEMORY')

    dbInstance = drizzle(sqliteInstance, { schema })
  }

  return dbInstance
}

export function closeDB() {
  if (sqliteInstance) {
    sqliteInstance.close()
    sqliteInstance = null
    dbInstance = null
  }
}

export type User = typeof schema.users.$inferSelect
export type Post = typeof schema.posts.$inferSelect
export type NewPost = typeof schema.posts.$inferInsert
export type Photo = typeof schema.photos.$inferSelect
export type PipelineQueueItem = typeof schema.pipelineQueue.$inferSelect
export type NewPipelineQueueItem = typeof schema.pipelineQueue.$inferInsert
