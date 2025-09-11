// server/api/admin/mechanics/[id]/profile.patch.ts
import { prisma } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../../utils/rateLimiter'
import logger from '../../../../utils/logger'
import { z } from 'zod'

// Request body validation
const BodySchema = z.object({
  fullName: z.string().trim().min(1).max(100).optional(),
  city: z.string().trim().max(50).optional(),
  tier: z.enum(['BASIC', 'PRO', 'ELITE']).optional(),
  specialties: z.string().trim().max(500).optional()
})

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can update mechanic profile
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 30 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.mechanic.profile:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 30
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
    
    // 5. Check if mechanic exists
    const existingMechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
      select: { 
        id: true,
        user: {
          select: { 
            id: true,
            fullName: true 
          }
        }
      }
    })
    
    if (!existingMechanic) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Mechanic not found'
      })
    }
    
    // 6. Update mechanic profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update mechanic fields
      const updatedMechanic = await tx.mechanic.update({
        where: { id: mechanicId },
        data: {
          city: validatedBody.city,
          tier: validatedBody.tier,
          specialties: validatedBody.specialties
        },
        select: {
          id: true,
          city: true,
          tier: true,
          specialties: true
        }
      })
      
      // Update user fullName if provided
      let updatedUser = null
      if (validatedBody.fullName) {
        updatedUser = await tx.user.update({
          where: { id: existingMechanic.user.id },
          data: { fullName: validatedBody.fullName },
          select: { id: true, fullName: true }
        })
      }
      
      return { updatedMechanic, updatedUser }
    })
    
    // 7. Log the action
    logger.info({
      adminId: auth.id,
      mechanicId: existingMechanic.id,
      mechanicName: existingMechanic.user.fullName,
      updatedFields: Object.keys(validatedBody),
      ip
    }, '[ADMIN MECHANIC PROFILE API] Mechanic profile updated')
    
    // 8. Return response
    return {
      ok: true,
      mechanicId: result.updatedMechanic.id,
      updated: {
        fullName: result.updatedUser?.fullName,
        city: result.updatedMechanic.city,
        tier: result.updatedMechanic.tier,
        specialties: result.updatedMechanic.specialties
      }
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
    
    logger.error({ err: error }, '[ADMIN MECHANIC PROFILE API] Error updating mechanic profile')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while updating mechanic profile'
    })
  }
})
