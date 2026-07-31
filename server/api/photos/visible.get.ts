import { desc } from 'drizzle-orm'

export default eventHandler(async () => {
  const db = useDB()

  return db
    .select()
    .from(tables.photos)
    .orderBy(desc(tables.photos.dateTaken))
    .all()
})
