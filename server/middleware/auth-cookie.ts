// PROD: Auth cookie middleware with minimal logging for production
import { defineEventHandler, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export default defineEventHandler((event) => {
  // از کوکی access-token بخوان
  const at = getCookie(event, 'at')
  if (!at) {
    return
  }

  try {
    const dec = jwt.verify(at, JWT_SECRET) as any
    // ⚠️ مهم: در توکن شما claim، userId است (نه uid)
    const id = dec.userId ?? dec.uid ?? dec.sub
    const role = dec.role
    if (!id || !role) {
      return
    }

    // در کانتکست بگذار تا همهٔ APIها ببینند
    ;(event.context as any).authUser = { id, role, phone: dec.phone }
    ;(event.context as any).authUserId = id
  } catch (error) {
    console.error('[AUTH COOKIE MIDDLEWARE] Token verification failed:', error)
    // نامعتبر/منقضی؟ اشکالی ندارد، فقط کانتکست را پر نکن
  }
})
