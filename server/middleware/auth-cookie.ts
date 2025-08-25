// server/middleware/auth-cookie.ts
import { defineEventHandler, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export default defineEventHandler((event) => {
  console.log('[AUTH COOKIE MIDDLEWARE] Processing request')
  
  // از کوکی access-token بخوان
  const at = getCookie(event, 'at')
  if (!at) {
    console.log('[AUTH COOKIE MIDDLEWARE] No access token cookie found')
    return
  }

  try {
    console.log('[AUTH COOKIE MIDDLEWARE] Verifying token')
    const dec = jwt.verify(at, JWT_SECRET) as any
    // ⚠️ مهم: در توکن شما claim، userId است (نه uid)
    const id = dec.userId ?? dec.uid ?? dec.sub
    const role = dec.role
    if (!id || !role) {
      console.log('[AUTH COOKIE MIDDLEWARE] Invalid token claims:', { id, role })
      return
    }

    // در کانتکست بگذار تا همهٔ APIها ببینند
    ;(event.context as any).authUser = { id, role, phone: dec.phone }
    ;(event.context as any).authUserId = id
    console.log('[AUTH COOKIE MIDDLEWARE] Token verified, user set in context:', { id, role })
  } catch (error) {
    console.error('[AUTH COOKIE MIDDLEWARE] Token verification failed:', error)
    // نامعتبر/منقضی؟ اشکالی ندارد، فقط کانتکست را پر نکن
  }
})
