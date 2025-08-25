// server/api/mechanic/auth-test-simple.get.ts
import { defineEventHandler, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export default defineEventHandler(async (event) => {
  console.log('[MECHANIC AUTH SIMPLE TEST API] Simple auth test endpoint called')
  
  try {
    // بررسی کوکی
    const at = getCookie(event, 'at')
    console.log('[MECHANIC AUTH SIMPLE TEST API] Cookie found:', !!at)
    
    if (!at) {
      return {
        message: 'No token in cookie',
        hasToken: false,
        timestamp: new Date().toISOString()
      }
    }
    
    // بررسی اعتبار توکن
    try {
      const decoded = jwt.verify(at, JWT_SECRET) as any
      console.log('[MECHANIC AUTH SIMPLE TEST API] Token verified:', { 
        userId: decoded.userId, 
        role: decoded.role,
        exp: decoded.exp,
        iat: decoded.iat
      })
      
      // بررسی انقضای توکن
      const now = Math.floor(Date.now() / 1000)
      const isExpired = decoded.exp < now
      
      return {
        message: 'Token analysis complete',
        hasToken: true,
        tokenValid: true,
        tokenExpired: isExpired,
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
      console.error('[MECHANIC AUTH SIMPLE TEST API] JWT verification failed:', jwtError)
      return {
        message: 'Token verification failed',
        hasToken: true,
        tokenValid: false,
        error: jwtError.message,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('[MECHANIC AUTH SIMPLE TEST API] General error:', error)
    return {
      message: 'General error occurred',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
})
