import { DEFAULT_SETTINGS } from '../services/settings/contants'
import { settingsManager } from '../services/settings/settingsManager'
import { and, eq, tables, useDB } from '../utils/db'

export default defineNitroPlugin(async (_nitroApp) => {
  const _settingsManager = settingsManager

  _settingsManager.setInitializingFlag(true)

  try {
    await _settingsManager.init(DEFAULT_SETTINGS)

    await removeDeprecatedSettings()

    await migrateRuntimeConfigToSettings()

    await syncGithubOAuthEnvFromSettings()
  } finally {
    _settingsManager.setInitializingFlag(false)
  }
})

async function migrateRuntimeConfigToSettings() {
  const config = useRuntimeConfig() as any
  const _logger = logger.dynamic('settings-migration')

  try {
    if (config.public.app) {
      _logger.info('Migrating app settings')
      const appSettings = {
        title: config.public.app.title,
        slogan: config.public.app.slogan,
        author: config.public.app.author,
        avatarUrl: config.public.app.avatarUrl,
      }

      for (const [key, value] of Object.entries(appSettings)) {
        if (value) {
          try {
            await settingsManager.set('app', key as any, value, undefined, true)
          } catch (error) {
            _logger.warn(`Failed to migrate app.${key}:`, error)
          }
        }
      }
    }

    const githubOauthConfig = config.oauth?.github || {}
    if (config.public?.oauth?.github?.enabled === true) {
      try {
        await settingsManager.set(
          'system',
          'auth.github.enabled' as any,
          true,
          undefined,
          true,
        )
      } catch (error) {
        _logger.warn('Failed to migrate system.auth.github.enabled:', error)
      }
    }

    const githubOauthSettings = {
      'auth.github.clientId': githubOauthConfig.clientId || '',
      'auth.github.clientSecret': githubOauthConfig.clientSecret || '',
    }

    for (const [key, value] of Object.entries(githubOauthSettings)) {
      if (typeof value === 'string' && value.length > 0) {
        try {
          await settingsManager.set('system', key as any, value, undefined, true)
        } catch (error) {
          _logger.warn(`Failed to migrate system.${key}:`, error)
        }
      }
    }

    if (config.STORAGE_PROVIDER || config.provider) {
      _logger.info('Migrating storage configuration')

      const storageProvider = config.STORAGE_PROVIDER || 'local'
      const providerConfig =
        config.provider?.[storageProvider as keyof typeof config.provider]

      if (providerConfig) {
        const normalizedConfig = normalizeProviderConfig(
          storageProvider,
          providerConfig,
        )

        if (!isRuntimeProviderConfigUsable(normalizedConfig)) {
          _logger.info(
            `Skipping storage migration for ${storageProvider}: runtime config is incomplete`,
          )
        } else {
          try {
            const existingProviders = await settingsManager.storage.getProviders()
            const sameTypeProviderExists = existingProviders.some(
              (provider) => provider.provider === storageProvider,
            )

            if (sameTypeProviderExists) {
              _logger.info(
                `Storage provider of type ${storageProvider} already exists, skipping creation`,
              )
            } else {
              const providerName = `Migrated ${storageProvider} Provider`

              const providerId = await settingsManager.storage.addProvider({
                name: providerName,
                provider: storageProvider as 's3' | 'local',
                config: normalizedConfig,
              })

              await settingsManager.set(
                'storage',
                'provider',
                providerId,
                undefined,
                true,
              )
              _logger.info(
                `Storage provider migrated and set as active. Provider ID: ${providerId}`,
              )
            }
          } catch (error) {
            _logger.error('Failed to migrate storage provider:', error)
          }
        }
      }
    }

    _logger.info('Configuration migration completed')
  } catch (error) {
    _logger.error('Failed to migrate configurations:', error)
  }
}

async function syncGithubOAuthEnvFromSettings() {
  const config = useRuntimeConfig() as any

  const enabled = await settingsManager.get<boolean>(
    'system',
    'auth.github.enabled' as any,
    Boolean(config.public?.oauth?.github?.enabled),
  )
  const clientId = await settingsManager.get<string>(
    'system',
    'auth.github.clientId' as any,
    config.oauth?.github?.clientId || '',
  )
  const clientSecret = await settingsManager.get<string>(
    'system',
    'auth.github.clientSecret' as any,
    config.oauth?.github?.clientSecret || '',
  )

  const canEnableGithubOauth = Boolean(enabled && clientId && clientSecret)

  if (canEnableGithubOauth) {
    process.env.NUXT_OAUTH_GITHUB_CLIENT_ID = clientId || ''
    process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET = clientSecret || ''
  } else {
    delete process.env.NUXT_OAUTH_GITHUB_CLIENT_ID
    delete process.env.NUXT_OAUTH_CLIENT_SECRET
  }
}

async function removeDeprecatedSettings() {
  const db = useDB()

  db.delete(tables.settings)
    .where(
      and(
        eq(tables.settings.namespace, 'app'),
        eq(tables.settings.key, 'upload.maxFileSize'),
      ),
    )
    .run()
}

function normalizeProviderConfig(provider: string, config: any): any {
  switch (provider) {
    case 's3':
      return {
        provider: 's3',
        endpoint: config.endpoint || '',
        bucket: config.bucket || '',
        region: config.region || 'auto',
        accessKeyId: config.accessKeyId || '',
        secretAccessKey: config.secretAccessKey || '',
        prefix: config.prefix || '/photos',
        cdnUrl: config.cdnUrl || '',
        forcePathStyle: config.forcePathStyle ?? false,
      }

    case 'local':
      return {
        provider: 'local',
        basePath: config.localPath || './data/storage',
        baseUrl: config.baseUrl || '/storage',
        prefix: config.prefix || 'photos/',
      }

    default:
      return config
  }
}

function isRuntimeProviderConfigUsable(config: any): boolean {
  if (!config || !config.provider) {
    return false
  }

  switch (config.provider) {
    case 's3':
      return Boolean(
        config.endpoint &&
          config.bucket &&
          config.accessKeyId &&
          config.secretAccessKey,
      )
    case 'local':
      return Boolean(config.basePath)
    default:
      return false
  }
}
