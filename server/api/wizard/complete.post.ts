import { settingsManager } from '~~/server/services/settings/settingsManager'

export default eventHandler(async () => {
  await settingsManager.set('system', 'firstLaunch', false, undefined, true)
  return { success: true }
})
