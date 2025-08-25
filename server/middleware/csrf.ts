import { defineEventHandler, getCookie, getRequestHeader, createError } from 'h3'

export default defineEventHandler((event) => {
  const method = event.method || ''
  if (!/^(POST|PUT|PATCH|DELETE)$/i.test(method)) return

  // ✅ مسیرهای معاف از CSRF (برای جلوگیری از race در اولین لاگین/رفرش)
  const path = event.path || ''
  if (
    path.startsWith('/api/auth/csrf') ||
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/refresh') ||
    path.startsWith('/api/auth/logout')
  ) {
    return
  }

  const cookieToken = getCookie(event, 'csrf')
  const headerToken = getRequestHeader(event, 'x-csrf-token')

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid CSRF token' })
  }
})
