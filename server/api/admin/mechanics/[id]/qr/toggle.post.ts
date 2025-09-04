// server/api/admin/mechanics/[id]/qr/toggle.post.ts
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'
import { rateLimitComposite, getClientIP } from '~/server/utils/rateLimiter'
import logger from '~/server/utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can toggle QR
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 20 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.mechanic.qr.toggle:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
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
    
    // 4. Get request body
    const body = await readBody(event)
    if (!body || typeof body.active !== 'boolean') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing or invalid active parameter'
      })
    }
    
    // 5. Check if mechanic exists
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
    
    // 6. Update QR active status
    const updatedMechanic = await prisma.mechanic.update({
      where: { id: mechanicId },
      data: { qrActive: body.active },
      select: { id: true, code: true, qrActive: true }
    })
    
    // 7. Log the action
    logger.info({
      adminId: auth.id,
      mechanicId: updatedMechanic.id,
      mechanicCode: updatedMechanic.code,
      previousStatus: existingMechanic.qrActive,
      newStatus: body.active,
      action: 'QR_TOGGLE'
    }, '[ADMIN MECHANIC QR TOGGLE API] QR status updated')
    
    // 8. Return response
    return {
      ok: true,
      mechanic: {
        id: updatedMechanic.id,
        code: updatedMechanic.code,
        qrActive: updatedMechanic.qrActive
      },
      message: `QR ${body.active ? 'فعال' : 'غیرفعال'} شد`
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ADMIN MECHANIC QR TOGGLE API] Error toggling QR status')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while updating QR status'
    })
  }
})
