// server/api/admin/mechanics/[id]/qr/regenerate.post.ts
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'
import { rateLimitComposite, getClientIP } from '~/server/utils/rateLimiter'
import logger from '~/server/utils/logger'
import { generateMechanicCode } from '~/server/utils/ids'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can regenerate QR
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 5 requests per hour per IP+User (very strict)
    const ip = getClientIP(event)
    const rateKey = `admin.mechanic.qr.regenerate:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5
    })
    
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many regeneration requests. Please wait before trying again.'
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
    
    // 4. Check if mechanic exists
    const existingMechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
      select: { id: true, code: true, qrActive: true }
    })
    
    if (!existingMechanic) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Mechanic not found'
      })
    }
    
    // 5. Generate new unique code
    let newCode: string
    let attempts = 0
    const maxAttempts = 10
    
    do {
      newCode = generateMechanicCode()
      attempts++
      
      // Check if code already exists
      const existing = await prisma.mechanic.findFirst({
        where: { code: newCode },
        select: { id: true }
      })
      
      if (!existing) break
      
      if (attempts >= maxAttempts) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Unable to generate unique code after multiple attempts'
        })
      }
    } while (true)
    
    // 6. Update mechanic with new code and ensure QR is active
    const updatedMechanic = await prisma.mechanic.update({
      where: { id: mechanicId },
      data: { 
        code: newCode,
        qrActive: true // Always activate when regenerating
      },
      select: { id: true, code: true, qrActive: true }
    })
    
    // 7. Log the action with security details
    logger.warn({
      adminId: auth.id,
      mechanicId: existingMechanic.id,
      oldCode: existingMechanic.code,
      newCode: newCode,
      action: 'QR_REGENERATE',
      ip: ip,
      userAgent: event.headers.get('user-agent') || 'unknown'
    }, '[ADMIN MECHANIC QR REGENERATE API] QR code regenerated - SECURITY EVENT')
    
    // 8. Return response
    return {
      ok: true,
      mechanic: {
        id: updatedMechanic.id,
        code: updatedMechanic.code,
        qrActive: updatedMechanic.qrActive
      },
      message: 'کد QR با موفقیت بازتولید شد و فعال شد',
      warning: 'کد قبلی باطل شده است'
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ADMIN MECHANIC QR REGENERATE API] Error regenerating QR code')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while regenerating QR code'
    })
  }
})
