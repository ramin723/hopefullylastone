// server/middleware/01-rate-limit.ts
import { defineEventHandler, getRequestHeader, getRequestURL, createError } from 'h3'

/**
 * In-memory rate limit (برای یک نود). در Prod چندنودی بهتره Redis بذاریم.
 * کلید: ip + routeKey + userId (اگر موجود باشد)
 */
type Entry = { ts: number }
const BUCKET = new Map<string, Entry[]>()

// قوانین خاص مسیرها:
const RULES: { test: (path: string) => boolean; limit: number; windowMs: number }[] = [
  { test: p => p.startsWith('/api/auth/login'),                 limit: 5,  windowMs: 60_000 }, // 5/min/IP
  { test: p => p.startsWith('/api/auth/otp/request'),           limit: 5,  windowMs: 600_000 }, // 5/10min/IP (OTP request)
  { test: p => p.startsWith('/api/auth/otp/verify'),            limit: 10, windowMs: 600_000 }, // 10/10min/IP (OTP verify)
  { test: p => p.startsWith('/api/auth/csrf'),                  limit: 60, windowMs: 300_000 }, // 60/5min/IP (CSRF token requests)
  { test: p => p.startsWith('/api/transactions'),               limit: 20, windowMs: 60_000 }, // 20/min/user/IP
  { test: p => p.startsWith('/api/settlements') && p.endsWith('/mark-paid'), limit: 10, windowMs: 60_000 }, // 10/min
  { test: p => p === '/api/settlements' && true,                limit: 10, windowMs: 60_000 }, // create/list throttle
  { test: p => p.startsWith('/api/admin/mechanics') && p.includes('/code'), limit: 30, windowMs: 300_000 }, // 30/5min for code actions
  { test: p => p.startsWith('/api/admin/mechanics') && p.includes('/profile'), limit: 30, windowMs: 300_000 }, // 30/5min for profile updates
  { test: p => p.startsWith('/api/admin/mechanics') && (p.includes('/suspend') || p.includes('/unsuspend')), limit: 20, windowMs: 600_000 }, // 20/10min for suspend/unsuspend
  { test: p => p.startsWith('/api/admin/mechanics') && p.includes('/reset-password'), limit: 20, windowMs: 600_000 }, // 20/10min for password reset
  { test: p => p.startsWith('/api/admin/mechanics') && p.includes('/reinvite'), limit: 10, windowMs: 600_000 }, // 10/10min for reinvite
  { test: p => p === '/api/admin/mechanics' && true, limit: 20, windowMs: 300_000 }, // 20/5min for create mechanic
]
// قانون پیش‌فرض (اگر لازم داشتی):
const DEFAULT = { limit: 120, windowMs: 60_000 }

function getIp(event: any) {
  const xf = getRequestHeader(event, 'x-forwarded-for')
  if (xf) return xf.split(',')[0].trim()
  // @ts-ignore
  return event.node?.req?.socket?.remoteAddress || 'unknown'
}

export default defineEventHandler((event) => {
  // فقط برای API
  const url = getRequestURL(event)
  const path = url.pathname
  if (!path.startsWith('/api/')) return

  const ip = getIp(event)
  const userId = (event.context as any).authUserId // اگر auth-cookie قبل از این اجرا شود
  const rule = RULES.find(r => r.test(path)) || DEFAULT
  const routeKey =
    path.startsWith('/api/transactions') ? '/api/transactions' :
    path.startsWith('/api/auth/login')   ? '/api/auth/login'   :
    path.startsWith('/api/auth/otp/request') ? '/api/auth/otp/request' :
    path.startsWith('/api/auth/otp/verify') ? '/api/auth/otp/verify' :
    path.startsWith('/api/auth/csrf')    ? '/api/auth/csrf'    :
    (path.startsWith('/api/settlements') && path.endsWith('/mark-paid')) ? '/api/settlements/mark-paid' :
    (path === '/api/settlements') ? '/api/settlements' :
    (path.startsWith('/api/admin/mechanics') && path.includes('/code')) ? '/api/admin/mechanics/code' :
    (path.startsWith('/api/admin/mechanics') && path.includes('/profile')) ? '/api/admin/mechanics/profile' :
    (path.startsWith('/api/admin/mechanics') && (path.includes('/suspend') || path.includes('/unsuspend'))) ? '/api/admin/mechanics/suspend' :
    (path.startsWith('/api/admin/mechanics') && path.includes('/reset-password')) ? '/api/admin/mechanics/reset-password' :
    (path.startsWith('/api/admin/mechanics') && path.includes('/reinvite')) ? '/api/admin/mechanics/reinvite' :
    (path === '/api/admin/mechanics') ? '/api/admin/mechanics' :
    path

  const key = `${routeKey}::ip:${ip}::user:${userId ?? '-'}`

  const now = Date.now()
  const win = rule.windowMs
  const list = BUCKET.get(key) || []
  // پاک کردن قدیمی‌ها
  while (list.length && (now - list[0].ts) > win) list.shift()
  if (list.length >= rule.limit) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }
  list.push({ ts: now })
  BUCKET.set(key, list)
})
