// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  console.log('[AUTH MIDDLEWARE] Route:', to.path, 'Auth required:', to.meta.auth)
  
  // صفحهٔ ورود آزاد است
  if (to.path === '/login' || to.meta.auth === false) {
    console.log('[AUTH MIDDLEWARE] Public route, skipping auth')
    return
  }

  const user = useState<any>('auth:user', () => null)
  const hydrated = useState<boolean>('auth:hydrated', () => false)

  console.log('[AUTH MIDDLEWARE] Current state - hydrated:', hydrated.value, 'user:', !!user.value)

  // فقط یک بار هیدریت شویم
  if (!hydrated.value) {
    console.log('[AUTH MIDDLEWARE] Starting hydration')
    try {
      // نکتهٔ مهم: روی سرور، کوکی‌های درخواستِ کاربر را به /me پاس بده
      const headers = process.server ? (useRequestHeaders(['cookie']) as Record<string, string>) : undefined
      console.log('[AUTH MIDDLEWARE] Calling /api/auth/me with headers:', !!headers)
      const res: any = await $fetch('/api/auth/me', { headers })
      user.value = res?.user ?? null
      console.log('[AUTH MIDDLEWARE] /me response - user:', !!user.value, 'role:', user.value?.role)
    } catch (error) {
      console.error('[AUTH MIDDLEWARE] /me error:', error)
      user.value = null
    } finally {
      hydrated.value = true
      console.log('[AUTH MIDDLEWARE] Hydration completed')
    }
  }

  if (!user.value) {
    console.log('[AUTH MIDDLEWARE] No user, redirecting to login')
    return navigateTo('/login')
  }
  
  console.log('[AUTH MIDDLEWARE] Auth successful, proceeding')
})
