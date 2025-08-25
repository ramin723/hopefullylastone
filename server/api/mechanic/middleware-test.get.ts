// server/api/mechanic/middleware-test.get.ts
import { defineEventHandler, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export default defineEventHandler(async (event) => {
  console.log('[MECHANIC MIDDLEWARE TEST API] Middleware test endpoint called')
  
  try {
    // بررسی کوکی
    const at = getCookie(event, 'at')
    console.log('[MECHANIC MIDDLEWARE TEST API] Cookie found:', !!at)
    
    if (!at) {
      return {
        message: 'No token in cookie',
        hasToken: false,
        middlewareStatus: 'No token',
        timestamp: new Date().toISOString()
      }
    }
    
    // بررسی اعتبار توکن
    try {
      const decoded = jwt.verify(at, JWT_SECRET) as any
      console.log('[MECHANIC MIDDLEWARE TEST API] Token verified:', { 
        userId: decoded.userId, 
        role: decoded.role,
        exp: decoded.exp,
        iat: decoded.iat
      })
      
      // بررسی انقضای توکن
      const now = Math.floor(Date.now() / 1000)
      const isExpired = decoded.exp < now
      
      // بررسی role
      const isMechanic = decoded.role === 'MECHANIC'
      const allowedRoles = ['MECHANIC']
      const hasPermission = allowedRoles.includes(decoded.role)
      
      return {
        message: 'Middleware analysis complete',
        hasToken: true,
        tokenValid: true,
        tokenExpired: isExpired,
        middlewareStatus: 'Token valid',
        permissions: {
          isMechanic,
          hasPermission,
          userRole: decoded.role,
          allowedRoles
        },
        tokenData: {
          userId: decoded.userId,
          role: decoded.role,
          phone: decoded.phone,
          exp: decoded.exp,
          iat: decoded.iat,
          now,
          timeUntilExpiry: decoded.exp - now
        },
        timestamp: new Date().toISOString()
      }
    } catch (jwtError: any) {
      console.error('[MECHANIC MIDDLEWARE TEST API] JWT verification failed:', jwtError)
      return {
        message: 'Token verification failed',
        hasToken: true,
        tokenValid: false,
        middlewareStatus: 'Token invalid',
        error: jwtError.message,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('[MECHANIC MIDDLEWARE TEST API] General error:', error)
    return {
      message: 'General error occurred',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
})
