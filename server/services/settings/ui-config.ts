import type { FieldUIConfig } from '~~/shared/types/settings'

const APP_SETTINGS_UI: Record<string, FieldUIConfig> = {
  title: { type: 'input', required: true, placeholder: 'My Blog' },
  slogan: { type: 'input', placeholder: 'A place for stories' },
  author: { type: 'input', placeholder: 'Your name' },
  avatarUrl: { type: 'url', placeholder: 'https://...' },
}

const SYSTEM_SETTINGS_UI: Record<string, FieldUIConfig> = {
  'upload.maxFileSize': { type: 'number', min: 1, max: 1024, help: 'MB' },
  'upload.duplicateCheck.enabled': { type: 'toggle' },
  'upload.duplicateCheck.mode': {
    type: 'select',
    options: [
      { label: 'Skip', value: 'skip' },
      { label: 'Warn', value: 'warn' },
      { label: 'Block', value: 'block' },
    ],
  },
  webglImageViewerDebug: { type: 'toggle' },
  'auth.github.enabled': { type: 'toggle' },
  'auth.github.clientId': { type: 'input', placeholder: 'GitHub OAuth Client ID' },
  'auth.github.clientSecret': { type: 'password', placeholder: 'GitHub OAuth Client Secret' },
}

const PRIVACY_SETTINGS_UI: Record<string, FieldUIConfig> = {
  'upload.autoEraseLocation': { type: 'toggle' },
}

const LOCATION_SETTINGS_UI: Record<string, FieldUIConfig> = {
  language: {
    type: 'select',
    options: [
      { label: 'English', value: 'en' },
      { label: '简体中文', value: 'zh-CN' },
      { label: '繁體中文', value: 'zh-TW' },
      { label: '日本語', value: 'ja' },
    ],
  },
  'mapbox.token': { type: 'password', placeholder: 'Mapbox token (optional, for reverse geocoding)' },
  'nominatim.baseUrl': { type: 'url', placeholder: 'https://nominatim.openstreetmap.org' },
}

const LASTFM_SETTINGS_UI: Record<string, FieldUIConfig> = {
  apiKey: {
    type: 'password',
    label: 'API key',
    placeholder: 'Your Last.fm API key',
    help: 'Create one at last.fm/api/account/create',
  },
  user: {
    type: 'input',
    label: 'Username',
    placeholder: 'Your Last.fm username',
  },
  period: {
    type: 'select',
    label: 'Period',
    options: [
      { label: 'Last 7 days', value: '7day' },
      { label: 'Last 30 days', value: '1month' },
      { label: 'Last 3 months', value: '3month' },
      { label: 'Last 6 months', value: '6month' },
      { label: 'Last 12 months', value: '12month' },
    ],
  },
}

const NAMESPACE_UI_MAP: Record<string, Record<string, FieldUIConfig>> = {
  app: APP_SETTINGS_UI,
  system: SYSTEM_SETTINGS_UI,
  privacy: PRIVACY_SETTINGS_UI,
  location: LOCATION_SETTINGS_UI,
  lastfm: LASTFM_SETTINGS_UI,
}

export function getSettingUIConfig(
  namespace: string,
  key: string,
): FieldUIConfig | null {
  const namespaceUI = NAMESPACE_UI_MAP[namespace]
  if (!namespaceUI) return null
  return namespaceUI[key] || null
}
