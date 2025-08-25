// composables/useAuth.ts
export function useAuth() {
  const user = useState<any>('auth:user', () => null)
  const hydrated = useState<boolean>('auth:hydrated', () => false)
  const hydrating = useState<Promise<void> | null>('auth:hydrating')

  // فراخوانی دستی: وقتی بعد از login می‌خوای دوباره /me را بزنی
  const ensureAuth = async () => {
    console.log('[AUTH] ensureAuth called, hydrated:', hydrated.value, 'user:', !!user.value)
    if (hydrated.value && user.value) return user.value
    if (hydrating.value) {
      console.log('[AUTH] Already hydrating, waiting...')
      await hydrating.value
      return user.value
    }
    // شروع یک هیدریت جدید
    console.log('[AUTH] Starting new hydration')
    hydrating.value = (async () => {
      try {
        console.log('[AUTH] Calling /api/auth/me')
        const res = await $fetch('/api/auth/me')
        user.value = (res as any).user
        console.log('[AUTH] ensureAuth ok:', user.value?.id, user.value?.role)
      } catch (error) {
        console.error('[AUTH] ensureAuth error:', error)
        user.value = null
      } finally {
        hydrated.value = true
        console.log('[AUTH] Hydration completed')
      }
    })()
    await hydrating.value
    return user.value
  }

  return { user, hydrated, ensureAuth }
}
