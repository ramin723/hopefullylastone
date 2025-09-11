// server/api/admin/mechanics/[id]/reset-password.post.ts
import { prisma } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../../utils/rateLimiter'
import logger from '../../../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can reset mechanic passwords
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 20 requests per 10 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.mechanic.reset-password:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 20
    })
    
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests'
      })
    }
    
    // 3. Get mechanic ID from URL
    const mechanicId = parseInt(event.context.params.id)
    if (!mechanicId || isNaN(mechanicId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid mechanic ID'
      })
    }
    
    // 4. Get current mechanic and user state
    const currentMechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
      select: { 
        id: true,
        userId: true,
        user: {
          select: { 
            fullName: true,
            mustChangePassword: true,
            passwordHash: true
          }
        }
      }
    })
    
    if (!currentMechanic) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Mechanic not found'
      })
    }
    
    // 5. Check if already needs password change and has no password
    if (currentMechanic.user.mustChangePassword && !currentMechanic.user.passwordHash) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User already needs to change password'
      })
    }
    
    // 6. Reset password and invalidate refresh tokens in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Reset password (set to empty and force change)
      const resetUser = await tx.user.update({
        where: { id: currentMechanic.userId },
        data: {
          passwordHash: '',
          mustChangePassword: true
        },
        select: { id: true, mustChangePassword: true, passwordHash: true }
      })
      
      // Invalidate all refresh tokens for this user
      await tx.refreshToken.updateMany({
        where: { 
          userId: currentMechanic.userId,
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      })
      
      return resetUser
    })
    
    // 7. Log the action
    logger.warn({
      adminId: auth.id,
      mechanicId: currentMechanic.id,
      mechanicName: currentMechanic.user.fullName,
      userId: currentMechanic.userId,
      previousMustChangePassword: currentMechanic.user.mustChangePassword,
      ip
    }, '[ADMIN MECHANIC RESET PASSWORD API] Password reset - SECURITY EVENT')
    
    // 8. Return response
    return {
      ok: true,
      mechanicId: currentMechanic.id,
      userId: currentMechanic.userId,
      mustChangePassword: result.mustChangePassword,
      passwordReset: true
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ADMIN MECHANIC RESET PASSWORD API] Error resetting password')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while resetting password'
    })
  }
})
