// server/api/admin/mechanics/[id]/unsuspend.post.ts
import { prisma } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../../utils/rateLimiter'
import logger from '../../../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can unsuspend mechanics
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 20 requests per 10 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.mechanic.unsuspend:${ip}:${auth.id}`
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
            suspendedAt: true,
            suspendReason: true
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
    
    // 5. Check if already not suspended
    if (!currentMechanic.user.suspendedAt) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User is not suspended'
      })
    }
    
    // 6. Unsuspend user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Unsuspend user
      const unsuspendedUser = await tx.user.update({
        where: { id: currentMechanic.userId },
        data: {
          suspendedAt: null,
          suspendReason: null
        },
        select: { id: true, suspendedAt: true, suspendReason: true }
      })
      
      return unsuspendedUser
    })
    
    // 7. Log the action
    logger.info({
      adminId: auth.id,
      mechanicId: currentMechanic.id,
      mechanicName: currentMechanic.user.fullName,
      userId: currentMechanic.userId,
      previousSuspendReason: currentMechanic.user.suspendReason,
      previousSuspendedAt: currentMechanic.user.suspendedAt,
      ip
    }, '[ADMIN MECHANIC UNSUSPEND API] User unsuspended')
    
    // 8. Return response
    return {
      ok: true,
      mechanicId: currentMechanic.id,
      userId: currentMechanic.userId,
      suspended: false,
      suspendedAt: null,
      suspendReason: null
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ADMIN MECHANIC UNSUSPEND API] Error unsuspending user')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while unsuspending user'
    })
  }
})
