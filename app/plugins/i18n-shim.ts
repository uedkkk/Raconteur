export function t(key: string, params?: Record<string, any>): string {
  if (params) {
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(`{${k}}`, String(v)),
      key,
    )
  }
  return key
}

export function useI18n() {
  return { t }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.globalProperties.$t = t
  nuxtApp.provide('i18n', { t })
})
