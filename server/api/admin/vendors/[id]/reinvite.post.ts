// server/api/admin/vendors/[id]/reinvite.post.ts
import { prisma } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../../utils/rateLimiter'
import logger from '../../../../utils/logger'
import { 
  generateInviteToken, 
  hashToken, 
  sendInviteSms,
  inviteActiveWhere
} from '../../../../utils/invite'
import { normalizePhone } from '../../../../utils/otp'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can reinvite vendors
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 10 requests per 10 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.vendor.reinvite:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 10
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
    
    // 4. Get current vendor and user details
    const currentVendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { 
        id: true,
        userId: true,
        storeName: true,
        user: {
          select: { 
            fullName: true,
            phone: true
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
    
    const phone = normalizePhone(currentVendor.user.phone)
    
    // 5. Check if there's an active invite for this phone/role
    const existingInvite = await prisma.invite.findFirst({
      where: inviteActiveWhere(phone, 'VENDOR')
    })
    
    if (existingInvite) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Active invite already exists for this vendor'
      })
    }
    
    // 6. Generate invite token and hash
    const token = generateInviteToken(16)
    const codeHash = hashToken(token)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    
    // 7. Create invite and send SMS in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create invite
      const invite = await tx.invite.create({
        data: {
          role: 'VENDOR',
          phone: phone,
          codeHash,
          expiresAt,
          createdBy: auth.id,
          meta: {
            fullName: currentVendor.user.fullName,
            vendorId: currentVendor.id
          }
        }
      })
      
      // Send SMS
      const smsResult = await sendInviteSms(phone, token, 'VENDOR', currentVendor.user.fullName)
      
      if (!smsResult.sent) {
        // If SMS fails, rollback transaction
        throw createError({
          statusCode: 502,
          statusMessage: 'SMS Service Unavailable',
          message: smsResult.error || 'Failed to send invite SMS'
        })
      }
      
      // Update invite with sent status
      const updatedInvite = await tx.invite.update({
        where: { id: invite.id },
        data: { sent: smsResult.sent }
      })
      
      return { invite: updatedInvite, smsResult }
    })
    
    // 8. Log the action
    logger.info({
      adminId: auth.id,
      vendorId: currentVendor.id,
      vendorName: currentVendor.storeName,
      phone: phone.slice(0, 3) + '***' + phone.slice(-2), // Masked phone
      inviteId: result.invite.id,
      expiresAt,
      ip
    }, '[ADMIN VENDOR REINVITE API] Invite sent to vendor')
    
    // 9. Return response
    return {
      ok: true,
      vendorId: currentVendor.id,
      inviteId: result.invite.id,
      sent: result.smsResult.sent,
      expiresAt,
      token: process.env.NODE_ENV === 'development' ? token : undefined, // Only return token in dev
      link: process.env.NODE_ENV === 'development' ? `${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invite/${token}` : undefined
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ADMIN VENDOR REINVITE API] Error sending reinvite')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while sending reinvite'
    })
  }
})
