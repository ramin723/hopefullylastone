// server/api/admin/mechanics/[id].get.ts
import { prisma } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../utils/rateLimiter'
import logger from '../../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can view mechanic details
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 60 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.mechanic.details:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 60
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
    
    // 4. Get mechanic with user details and stats
    const mechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
      include: {
        user: true,
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
    
    // 5. Calculate stats
    const stats = await prisma.transaction.aggregate({
      where: { mechanicId },
      _sum: {
        amountTotal: true,
        amountEligible: true
      }
    })
    
    // 6. Log the action (without PII)
    logger.info({
      adminId: auth.id,
      mechanicId: mechanic.id,
      action: 'view_details',
      ip
    }, '[ADMIN MECHANIC DETAILS API] Mechanic details retrieved')
    
    // 7. Return response with suspended status
    return {
      ok: true,
      mechanic: {
        id: mechanic.id,
        code: mechanic.code,
        qrActive: mechanic.qrActive,
        city: mechanic.city,
        specialties: mechanic.specialties,
        tier: mechanic.tier,
        createdAt: mechanic.createdAt,
        fullName: mechanic.user.fullName,
        phone: mechanic.user.phone,
        suspended: !!(mechanic.user as any).suspendedAt,
        suspendedAt: (mechanic.user as any).suspendedAt,
        suspendReason: (mechanic.user as any).suspendReason,
        mustChangePassword: mechanic.user.mustChangePassword,
        userCreatedAt: mechanic.user.createdAt,
        stats: {
          totalTransactions: mechanic._count.transactions,
          totalOrders: mechanic._count.orders,
          totalAmount: stats._sum.amountTotal || 0,
          totalEligible: stats._sum.amountEligible || 0
        }
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ADMIN MECHANIC DETAILS API] Error retrieving mechanic details')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while retrieving mechanic details'
    })
  }
})
