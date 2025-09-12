// server/api/admin/vendors/[id]/reset-password.post.ts
import { prisma } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../../utils/rateLimiter'
import logger from '../../../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can reset vendor passwords
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 20 requests per 10 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.vendor.reset-password:${ip}:${auth.id}`
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
            mustChangePassword: true,
            passwordHash: true
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
    
    // 5. Check if already needs password change and has no password
    if (currentVendor.user.mustChangePassword && !currentVendor.user.passwordHash) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User already needs to change password'
      })
    }
    
    // 6. Reset password and invalidate refresh tokens in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Reset password (set to empty and force change)
      const resetUser = await tx.user.update({
        where: { id: currentVendor.userId },
        data: {
          passwordHash: '',
          mustChangePassword: true
        },
        select: { id: true, mustChangePassword: true, passwordHash: true }
      })
      
      // Invalidate all refresh tokens for this user
      await tx.refreshToken.updateMany({
        where: { 
          userId: currentVendor.userId,
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      })
      
      return resetUser
    })
    
    // 7. Log the action
    logger.warn({
      adminId: auth.id,
      vendorId: currentVendor.id,
      vendorName: currentVendor.storeName,
      userId: currentVendor.userId,
      previousMustChangePassword: currentVendor.user.mustChangePassword,
      ip
    }, '[ADMIN VENDOR RESET PASSWORD API] Password reset - SECURITY EVENT')
    
    // 8. Return response
    return {
      ok: true,
      vendorId: currentVendor.id,
      userId: currentVendor.userId,
      mustChangePassword: result.mustChangePassword,
      passwordReset: true
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ADMIN VENDOR RESET PASSWORD API] Error resetting password')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while resetting password'
    })
  }
})
