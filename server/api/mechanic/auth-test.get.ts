// server/api/mechanic/auth-test.get.ts
import { defineEventHandler, createError } from 'h3'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  console.log('[MECHANIC AUTH TEST API] Auth test endpoint called')
  
  try {
    const auth = await requireAuth(event, ['MECHANIC'])
    console.log('[MECHANIC AUTH TEST API] Auth successful:', { userId: auth.id, role: auth.role })
    
    return {
      message: 'Auth test successful',
      user: {
        id: auth.id,
        role: auth.role,
        phone: auth.phone
      },
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('[MECHANIC AUTH TEST API] Auth failed:', error)
    throw error
  }
})
