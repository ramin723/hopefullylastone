// composables/useAuth.ts
export function useAuth() {
  const user = useState<any>('auth:user', () => null)
  const hydrated = useState<boolean>('auth:hydrated', () => false)
  const hydrating = useState<Promise<void> | null>('auth:hydrating')

  // PROD: Manual auth hydration with minimal logging
  const ensureAuth = async () => {
    if (hydrated.value && user.value) return user.value
    if (hydrating.value) {
      await hydrating.value
      return user.value
    }
    // شروع یک هیدریت جدید
    hydrating.value = (async () => {
      try {
        const res = await $fetch('/api/auth/me', { credentials: 'include' })
        user.value = (res as any).user
      } catch (error) {
        console.error('[AUTH] ensureAuth error:', error)
        user.value = null
      } finally {
        hydrated.value = true
      }
    })()
    await hydrating.value
    return user.value
  }

  return { user, hydrated, ensureAuth }
}
