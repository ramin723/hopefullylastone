// server/api/admin/mechanics/[id]/suspend.post.ts
import { prisma } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../../utils/rateLimiter'
import logger from '../../../../utils/logger'
import { z } from 'zod'

// Request body validation
const BodySchema = z.object({
  reason: z.string().trim().max(200).optional()
})

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can suspend mechanics
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 20 requests per 10 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.mechanic.suspend:${ip}:${auth.id}`
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
    
    // 4. Parse and validate request body
    const body = await readBody(event)
    const validatedBody = BodySchema.parse(body)
    
    // 5. Get current mechanic and user state
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
    
    // 6. Check if already suspended
    if (currentMechanic.user.suspendedAt) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User is already suspended'
      })
    }
    
    // 7. Suspend user and invalidate refresh tokens in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Suspend user
      const suspendedUser = await tx.user.update({
        where: { id: currentMechanic.userId },
        data: {
          suspendedAt: new Date(),
          suspendReason: validatedBody.reason || null
        },
        select: { id: true, suspendedAt: true, suspendReason: true }
      })
      
      // Invalidate all refresh tokens for this user
      await tx.refreshToken.updateMany({
        where: { 
          userId: currentMechanic.userId,
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      })
      
      return suspendedUser
    })
    
    // 8. Log the action
    logger.warn({
      adminId: auth.id,
      mechanicId: currentMechanic.id,
      mechanicName: currentMechanic.user.fullName,
      userId: currentMechanic.userId,
      suspendReason: validatedBody.reason,
      suspendedAt: result.suspendedAt,
      ip
    }, '[ADMIN MECHANIC SUSPEND API] User suspended - SECURITY EVENT')
    
    // 9. Return response
    return {
      ok: true,
      mechanicId: currentMechanic.id,
      userId: currentMechanic.userId,
      suspended: true,
      suspendedAt: result.suspendedAt,
      suspendReason: result.suspendReason
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body',
        data: { errors: error.issues }
      })
    }
    
    logger.error({ err: error }, '[ADMIN MECHANIC SUSPEND API] Error suspending user')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while suspending user'
    })
  }
})
