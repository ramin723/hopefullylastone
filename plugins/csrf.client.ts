export default defineNuxtPlugin(async () => {
  // این پلاگین فقط برای دریافت اولیه CSRF token است
  // برای استفاده از CSRF، از composable useApi استفاده کنید
  const csrf = useState<string | null>('csrf', () => null)
  const csrfFetching = useState<boolean>('csrf-fetching', () => false)
  
  // Always fetch CSRF token on plugin initialization
  if (!csrf.value && !csrfFetching.value) {
    csrfFetching.value = true
    try {
      const res = await $fetch('/api/auth/csrf')
      csrf.value = (res as any).csrf
      console.log('[CSRF] Token initialized successfully')
    } catch (error) {
      console.error('[CSRF] Initial token fetch failed:', error)
      // Don't throw error here to avoid breaking the app
      // The useApi composable will handle CSRF token fetching when needed
    } finally {
      csrfFetching.value = false
    }
  }
})
