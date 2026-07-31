export interface RaconteurConfig {
  storage: import('~~/shared/types/storage').StorageConfig
}

export interface AnalyticsConfig {
  matomo: {
    enabled: boolean
    url: string
    siteId: string
  }
}
