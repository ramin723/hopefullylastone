// server/utils/auth.ts
import { getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export type UserRole = 'ADMIN' | 'VENDOR' | 'MECHANIC'
export type AuthUser = { id: number; role: UserRole; phone?: string }

// توکن را از context اگر بود می‌گیرد؛ وگرنه از خود کوکی می‌خواند.
export async function requireAuth(event: any, allowed?: UserRole[]): Promise<AuthUser> {
  console.log('[AUTH UTIL] requireAuth called, allowed roles:', allowed)
  
  let user = (event.context as any).authUser as AuthUser | undefined
  if (!user) {
    console.log('[AUTH UTIL] No user in context, checking cookie')
    const at = getCookie(event, 'at')
    if (!at) {
      console.log('[AUTH UTIL] No token in cookie')
      throw createError({ statusCode: 401, statusMessage: 'Missing token' })
    }
    try {
      console.log('[AUTH UTIL] Verifying token from cookie')
      const dec: any = jwt.verify(at, JWT_SECRET)
      const id = dec.userId ?? dec.uid ?? dec.sub
      const role = dec.role as UserRole
      if (!id || !role) {
        console.log('[AUTH UTIL] Bad token claims:', { id, role })
        throw new Error('bad claims')
      }
      user = { id, role, phone: dec.phone }
      ;(event.context as any).authUser = user
      ;(event.context as any).authUserId = id
      console.log('[AUTH UTIL] Token verified, user created:', { id, role })
    } catch (error) {
      console.error('[AUTH UTIL] Token verification failed:', error)
      throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    }
  } else {
    console.log('[AUTH UTIL] User found in context:', { id: user.id, role: user.role })
  }
  
  if (allowed && !allowed.includes(user.role)) {
    console.log('[AUTH UTIL] Role not allowed:', { userRole: user.role, allowed })
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  
  console.log('[AUTH UTIL] Auth successful:', { id: user.id, role: user.role })
  return user
}
