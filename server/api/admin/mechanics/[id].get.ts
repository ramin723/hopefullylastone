// server/api/admin/mechanics/[id].get.ts
import { prisma } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../utils/rateLimiter'
import logger from '../../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can view mechanic details
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 100 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.mechanic.detail:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 100
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
    
    // 4. Get mechanic with user info and stats
    const mechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        },
        _count: {
          select: {
            transactions: true,
            orders: true
          }
        }
      }
    })
    
    if (!mechanic) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Mechanic not found'
      })
    }
    
    // 5. Log successful retrieval (without PII)
    logger.info({
      adminId: auth.id,
      mechanicId: mechanic.id,
      mechanicCode: mechanic.code
    }, '[ADMIN MECHANIC DETAIL API] Mechanic details retrieved')
    
    // 6. Return response with full phone for ADMIN
    return {
      ok: true,
      mechanic: {
        id: mechanic.id,
        code: mechanic.code,
        tier: mechanic.tier,
        qrActive: mechanic.qrActive,
        createdAt: mechanic.createdAt,
        fullName: mechanic.user.fullName,
        phone: mechanic.user.phone, // Full phone for ADMIN
        stats: {
          totalTransactions: mechanic._count.transactions
        }
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ADMIN MECHANIC DETAIL API] Error retrieving mechanic details')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while retrieving mechanic details'
    })
  }
})
