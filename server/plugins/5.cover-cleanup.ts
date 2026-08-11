import { cleanupOldCovers } from '../utils/coverCleanup'

export default defineNitroPlugin(() => {
  const _logger = logger.dynamic('cover-cleanup')

  const run = () => {
    const result = cleanupOldCovers()
    if (result.deleted > 0) {
      _logger.info(`Cleaned up ${result.deleted} old cover(s), kept ${result.kept}`)
    }
  }

  setTimeout(run, 60 * 1000)
  setInterval(run, 24 * 60 * 60 * 1000)
})
