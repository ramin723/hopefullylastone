// PROD: Auth middleware with minimal logging for production
export default defineNuxtRouteMiddleware(async (to) => {
  // صفحهٔ ورود آزاد است
  if (to.path === '/login' || to.meta.auth === false) {
    return
  }

  const user = useState<any>('auth:user', () => null)
  const hydrated = useState<boolean>('auth:hydrated', () => false)

  // فقط یک بار هیدریت شویم
  if (!hydrated.value) {
    try {
      // نکتهٔ مهم: روی سرور، کوکی‌های درخواستِ کاربر را به /me پاس بده
      const headers = process.server ? (useRequestHeaders(['cookie']) as Record<string, string>) : undefined
      const res: any = await $fetch('/api/auth/me', { headers })
      user.value = res?.user ?? null
    } catch (error: any) {
      // فقط خطاهای غیر از 401 را log کنیم (401 طبیعی است)
      if (error?.statusCode !== 401) {
        console.error('[AUTH MIDDLEWARE] /me error:', error)
      }
      user.value = null
    } finally {
      hydrated.value = true
    }
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
