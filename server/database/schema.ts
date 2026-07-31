import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'
import type { NeededExif } from '~~/shared/types/photo'
import type { StorageConfig } from '~~/shared/types/storage'

type PipelineQueuePayload =
  | {
      type: 'photo'
      storageKey: string
      eraseLocation?: boolean
    }
  | {
      type: 'live-photo-video'
      storageKey: string
    }
  | {
      type: 'photo-reverse-geocoding'
      photoId: string
      latitude?: number | null
      longitude?: number | null
    }
  | {
      type: 'photo-erase-location'
      photoId: string
    }

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('name').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password'),
  avatar: text('avatar'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  isAdmin: integer('is_admin').default(0).notNull(),
})

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content'),
  excerpt: text('excerpt'),
  status: text('status', {
    enum: ['draft', 'published'],
  })
    .notNull()
    .default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
})

export const photos = sqliteTable('photos', {
  id: text('id').primaryKey().unique(),
  title: text('title'),
  description: text('description'),
  width: integer('width'),
  height: integer('height'),
  aspectRatio: real('aspect_ratio'),
  dateTaken: text('date_taken'),
  storageKey: text('storage_key'),
  thumbnailKey: text('thumbnail_key'),
  fileSize: integer('file_size'),
  lastModified: text('last_modified'),
  originalUrl: text('original_url'),
  thumbnailUrl: text('thumbnail_url'),
  thumbnailHash: text('thumbnail_hash'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  exif: text('exif', { mode: 'json' }).$type<NeededExif>(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  country: text('country'),
  city: text('city'),
  locationName: text('location_name'),
  isLivePhoto: integer('is_live_photo').default(0).notNull(),
  livePhotoVideoUrl: text('live_photo_video_url'),
  livePhotoVideoKey: text('live_photo_video_key'),
})

export const pipelineQueue = sqliteTable('pipeline_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  payload: text('payload', { mode: 'json' })
    .$type<PipelineQueuePayload>()
    .notNull()
    .default({
      type: 'photo',
      storageKey: '',
    } satisfies PipelineQueuePayload),
  priority: integer('priority').default(0).notNull(),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  status: text('status', {
    enum: ['pending', 'in-stages', 'completed', 'failed'],
  })
    .notNull()
    .default('pending'),
  statusStage: text('status_stage', {
    enum: [
      'preprocessing',
      'metadata',
      'thumbnail',
      'exif',
      'motion-photo',
      'reverse-geocoding',
      'live-photo',
      'location-erase',
    ],
  }),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
})

export const settings = sqliteTable(
  'settings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    namespace: text('namespace').notNull().default('common'),
    key: text('key').notNull(),
    type: text('type', {
      enum: ['string', 'number', 'boolean', 'json'],
    }).notNull(),
    value: text('value'),
    defaultValue: text('default_value'),
    label: text('label'),
    description: text('description'),
    isPublic: integer('is_public', { mode: 'boolean' })
      .default(false)
      .notNull(),
    isReadonly: integer('is_readonly', { mode: 'boolean' })
      .default(false)
      .notNull(),
    isSecret: integer('is_secret', { mode: 'boolean' })
      .default(false)
      .notNull(),
    enum: text('enum', { mode: 'json' }).$type<string[] | null>(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedBy: integer('updated_by').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [uniqueIndex('idx_namespace_key').on(t.namespace, t.key)],
)

export const settings_storage_providers = sqliteTable(
  'settings_storage_providers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    provider: text('provider', {
      enum: ['s3', 'local'],
    }).notNull(),
    config: text('config', { mode: 'json' }).$type<StorageConfig>().notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
)
