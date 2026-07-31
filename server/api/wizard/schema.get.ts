import { z } from 'zod'
import { settingsManager } from '~~/server/services/settings/settingsManager'
import type { FieldDescriptor } from '~~/shared/types/settings'

export default eventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    z.object({
      namespace: z.string().min(1),
    }).parse,
  )

  if (query.namespace === 'admin') {
    const defaultUsername = process.env.CFRAME_ADMIN_NAME || 'admin'
    const defaultEmail = process.env.CFRAME_ADMIN_EMAIL || ''
    const defaultPassword = process.env.CFRAME_ADMIN_PASSWORD || ''

    const fields: FieldDescriptor[] = [
      {
        namespace: 'admin',
        key: 'username',
        type: 'string',
        defaultValue: defaultUsername,
        value: defaultUsername,
        label: 'Username',
        ui: { type: 'input', required: true, placeholder: 'admin' },
      },
      {
        namespace: 'admin',
        key: 'email',
        type: 'string',
        defaultValue: defaultEmail,
        value: defaultEmail,
        label: 'Email',
        ui: { type: 'input', required: true, placeholder: 'admin@example.com' },
      },
      {
        namespace: 'admin',
        key: 'password',
        type: 'string',
        defaultValue: defaultPassword,
        value: defaultPassword,
        label: 'Password',
        ui: { type: 'password', required: true },
      },
      {
        namespace: 'admin',
        key: 'confirmPassword',
        type: 'string',
        defaultValue: defaultPassword,
        value: defaultPassword,
        label: 'Confirm Password',
        ui: { type: 'password', required: true },
      },
    ] as any[]

    return { namespace: 'admin', fields }
  }

  if (query.namespace === 'storage') {
    const storageFields = [
      { key: 'provider', type: 'string', defaultValue: 'local', label: 'Provider' },
      { key: 'name', type: 'string', defaultValue: 'Default Storage', label: 'Name' },
      { key: 'local.basePath', type: 'string', defaultValue: './data/storage', label: 'Local Path' },
      { key: 'local.baseUrl', type: 'string', defaultValue: '/storage', label: 'Local Base URL' },
      { key: 'local.prefix', type: 'string', defaultValue: 'photos/', label: 'Local Prefix' },
      { key: 's3.endpoint', type: 'string', defaultValue: '', label: 'S3 Endpoint' },
      { key: 's3.bucket', type: 'string', defaultValue: '', label: 'S3 Bucket' },
      { key: 's3.region', type: 'string', defaultValue: 'auto', label: 'S3 Region' },
      { key: 's3.accessKeyId', type: 'string', defaultValue: '', label: 'S3 Access Key ID' },
      { key: 's3.secretAccessKey', type: 'string', defaultValue: '', label: 'S3 Secret Access Key' },
      { key: 's3.prefix', type: 'string', defaultValue: '/photos', label: 'S3 Prefix' },
      { key: 's3.cdnUrl', type: 'string', defaultValue: '', label: 'S3 CDN URL' },
      { key: 's3.forcePathStyle', type: 'boolean', defaultValue: false, label: 'S3 Force Path Style' },
    ]

    const fields = storageFields.map((field) => ({
      namespace: 'storage',
      key: field.key,
      type: field.type as any,
      defaultValue: field.defaultValue,
      value: field.defaultValue,
      label: field.label,
      ui: { type: 'input' as const },
    })) as FieldDescriptor[]

    return { namespace: 'storage', fields }
  }

  try {
    const schema = await settingsManager.getSchema()
    const namespaceSettings = schema.filter(
      (s) => s.namespace === query.namespace,
    )

    const fields = namespaceSettings.map((setting) => ({
      ...setting,
      ui: { type: 'input' as const, required: false },
    }))

    return { namespace: query.namespace, fields }
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch wizard schema',
    })
  }
})
