export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return

  try {
    const user = await useRequestFetch()<any>('/api/profile')
    if (!user) return navigateTo('/signin')
  } catch {
    return navigateTo('/signin')
  }
})
