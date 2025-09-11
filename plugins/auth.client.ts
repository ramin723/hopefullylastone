// plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
  const user = useState<any>('auth:user', () => null)
  const hydrated = useState<boolean>('auth:hydrated', () => false)
  const hydrating = useState<Promise<void> | null>('auth:hydrating', () => null)

  // یک‌بار برای همیشه کاربر را از /me هیدریت می‌کنیم
  if (!hydrated.value && !hydrating.value) {
    hydrating.value = (async () => {
      try {
        const res = await $fetch('/api/auth/me', { credentials: 'include' })
        user.value = (res as any).user
        console.debug('[AUTH PLUGIN] me hydrated', { ok: !!user.value })
      } catch {
        user.value = null
        console.debug('[AUTH PLUGIN] me failed')
      } finally {
        hydrated.value = true
      }
    })()
  }

  // در هر صورت اگر در حال هیدریت است، منتظرش بمانیم
  if (!hydrated.value && hydrating.value) {
    await hydrating.value
  }
})
