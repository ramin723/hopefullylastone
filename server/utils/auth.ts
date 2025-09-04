// server/utils/auth.ts
import { getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export type UserRole = 'ADMIN' | 'VENDOR' | 'MECHANIC'
export type AuthUser = { id: number; role: UserRole; phone?: string }

// PROD: Auth utility with minimal logging for production
export async function requireAuth(event: any, allowed?: UserRole[]): Promise<AuthUser> {
  let user = (event.context as any).authUser as AuthUser | undefined
  if (!user) {
    const at = getCookie(event, 'at')
    if (!at) {
      throw createError({ statusCode: 401, statusMessage: 'Missing token' })
    }
    try {
      const dec: any = jwt.verify(at, JWT_SECRET)
      const id = dec.userId ?? dec.uid ?? dec.sub
      const role = dec.role as UserRole
      if (!id || !role) {
        throw new Error('bad claims')
      }
      user = { id, role, phone: dec.phone }
      ;(event.context as any).authUser = user
      ;(event.context as any).authUserId = id
    } catch (error) {
      console.error('[AUTH UTIL] Token verification failed:', error)
      throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    }
  }
  
  if (allowed && !allowed.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  
  return user
}
