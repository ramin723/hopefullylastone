export default defineNuxtPlugin(async () => {
  // این پلاگین فقط برای دریافت اولیه CSRF token است
  // برای استفاده از CSRF، از composable useApi استفاده کنید
  const csrf = useState<string | null>('csrf', () => null)
  
  if (!csrf.value) {
    try {
      const res = await $fetch('/api/auth/csrf')
      csrf.value = (res as any).csrf
      console.log('[CSRF] Initial token fetched')
    } catch (error) {
      console.warn('[CSRF] Initial token fetch failed:', error)
    }
  }
})
