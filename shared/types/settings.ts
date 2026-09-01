import type * as schema from '../../server/database/schema'

export type SettingType = typeof schema.settings.$inferSelect.type
export type SettingValue =
  | string
  | number
  | boolean
  | Record<string, any>
  | null

export type SettingConfig = Omit<
  typeof schema.settings.$inferInsert,
  'value' | 'defaultValue' | 'id' | 'updatedAt' | 'updatedBy' | 'enum'
> & {
  value?: SettingValue
  defaultValue: SettingValue
  enum?: ReadonlyArray<string>
}

export type SettingStorageProvider =
  typeof schema.settings_storage_providers.$inferSelect
export type NewSettingStorageProvider =
  typeof schema.settings_storage_providers.$inferInsert

export type FieldUIType =
  | 'input'
  | 'password'
  | 'url'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'tabs'
  | 'toggle'
  | 'number'
  | 'image'
  | 'custom'

export interface FieldUIConfig {
  type: FieldUIType
  label?: string
  placeholder?: string
  help?: string
  visibleIf?: {
    fieldKey: string
    value: SettingValue
  }
  options?: ReadonlyArray<{
    label: string
    value: SettingValue
    icon?: string
    description?: string
  }>
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'soft' | 'outline'
  icon?: string
}

export interface FieldDescriptor extends SettingConfig {
  ui: FieldUIConfig
}

export interface SettingsFieldsResponse {
  namespace: string
  fields: FieldDescriptor[]
}

export interface SettingsBatchUpdateRequest {
  updates: Array<{
    namespace: string
    key: string
    value: SettingValue
  }>
}
