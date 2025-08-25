// server/api/mechanic/context-test.get.ts
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('[MECHANIC CONTEXT TEST API] Context test endpoint called')
  
  try {
    // بررسی context
    const context = event.context as any
    console.log('[MECHANIC CONTEXT TEST API] Full context keys:', Object.keys(context))
    
    const authUser = context.authUser
    const authUserId = context.authUserId
    
    console.log('[MECHANIC CONTEXT TEST API] Auth context:', { 
      hasAuthUser: !!authUser, 
      hasAuthUserId: !!authUserId,
      authUser: authUser,
      authUserId: authUserId
    })
    
    // بررسی headers
    const headers = getHeaders(event)
    const cookieHeader = headers.cookie
    const authorizationHeader = headers.authorization
    
    console.log('[MECHANIC CONTEXT TEST API] Headers:', {
      hasCookie: !!cookieHeader,
      hasAuthorization: !!authorizationHeader,
      cookieLength: cookieHeader?.length || 0,
      authorizationLength: authorizationHeader?.length || 0
    })
    
    return {
      message: 'Context analysis complete',
      context: {
        hasAuthUser: !!authUser,
        hasAuthUserId: !!authUserId,
        authUser: authUser,
        authUserId: authUserId,
        contextKeys: Object.keys(context)
      },
      headers: {
        hasCookie: !!cookieHeader,
        hasAuthorization: !!authorizationHeader,
        cookieLength: cookieHeader?.length || 0,
        authorizationLength: authorizationHeader?.length || 0
      },
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('[MECHANIC CONTEXT TEST API] Context analysis failed:', error)
    return {
      message: 'Context analysis failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
})
