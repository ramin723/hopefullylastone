// server/api/admin/vendors/[id]/suspend.post.ts
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
    // 1. Authentication - only ADMIN can suspend vendors
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 20 requests per 10 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.vendor.suspend:${ip}:${auth.id}`
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
    
    // 3. Get vendor ID from URL
    const vendorId = parseInt(event.context.params.id)
    if (!vendorId || isNaN(vendorId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid vendor ID'
      })
    }
    
    // 4. Parse and validate request body
    const body = await readBody(event)
    const validatedBody = BodySchema.parse(body)
    
    // 5. Get current vendor and user state
    const currentVendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { 
        id: true,
        userId: true,
        storeName: true,
        user: {
          select: { 
            fullName: true,
            suspendedAt: true,
            suspendReason: true
          }
        }
      }
    })
    
    if (!currentVendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vendor not found'
      })
    }
    
    // 6. Check if already suspended
    if (currentVendor.user.suspendedAt) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User is already suspended'
      })
    }
    
    // 7. Suspend user and invalidate refresh tokens in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Suspend user
      const suspendedUser = await tx.user.update({
        where: { id: currentVendor.userId },
        data: {
          suspendedAt: new Date(),
          suspendReason: validatedBody.reason || null
        },
        select: { id: true, suspendedAt: true, suspendReason: true }
      })
      
      // Invalidate all refresh tokens for this user
      await tx.refreshToken.updateMany({
        where: { 
          userId: currentVendor.userId,
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      })
      
      return suspendedUser
    })
    
    // 8. Log the action
    logger.warn({
      adminId: auth.id,
      vendorId: currentVendor.id,
      vendorName: currentVendor.storeName,
      userId: currentVendor.userId,
      suspendReason: validatedBody.reason,
      suspendedAt: result.suspendedAt,
      ip
    }, '[ADMIN VENDOR SUSPEND API] User suspended - SECURITY EVENT')
    
    // 9. Return response
    return {
      ok: true,
      vendorId: currentVendor.id,
      userId: currentVendor.userId,
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
    
    logger.error({ err: error }, '[ADMIN VENDOR SUSPEND API] Error suspending user')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while suspending user'
    })
  }
})
