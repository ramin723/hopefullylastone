// server/api/admin/vendors/[id]/unsuspend.post.ts
import { prisma } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../../utils/rateLimiter'
import logger from '../../../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can unsuspend vendors
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 20 requests per 10 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.vendor.unsuspend:${ip}:${auth.id}`
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
    
    // 4. Get current vendor and user state
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
    
    // 5. Check if already not suspended
    if (!currentVendor.user.suspendedAt) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User is not suspended'
      })
    }
    
    // 6. Unsuspend user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Unsuspend user
      const unsuspendedUser = await tx.user.update({
        where: { id: currentVendor.userId },
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
      vendorId: currentVendor.id,
      vendorName: currentVendor.storeName,
      userId: currentVendor.userId,
      previousSuspendReason: currentVendor.user.suspendReason,
      previousSuspendedAt: currentVendor.user.suspendedAt,
      ip
    }, '[ADMIN VENDOR UNSUSPEND API] User unsuspended')
    
    // 8. Return response
    return {
      ok: true,
      vendorId: currentVendor.id,
      userId: currentVendor.userId,
      suspended: false,
      suspendedAt: null,
      suspendReason: null
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ADMIN VENDOR UNSUSPEND API] Error unsuspending user')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while unsuspending user'
    })
  }
})
