// server/api/admin/mechanics/index.get.ts
import { prisma } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../utils/rateLimiter'
import logger from '../../../utils/logger'
import { z } from 'zod'

// Query parameters validation
const QuerySchema = z.object({
  search: z.string().optional(),
  qrActive: z.enum(['true', 'false']).optional(),
  city: z.string().optional(),
  tier: z.enum(['BASIC', 'PRO', 'ELITE']).optional(),
  suspended: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default(() => 1),
  pageSize: z.string().regex(/^\d+$/).transform(Number).default(() => 20)
})

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can view mechanics list
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 60 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.mechanics.list:${ip}:${auth.id}`
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
    
    // 3. Parse and validate query parameters
    const query = getQuery(event)
    const { search, qrActive, city, tier, suspended, page, pageSize } = QuerySchema.parse(query)
    
    // 4. Calculate pagination
    const skip = (page - 1) * pageSize
    const take = pageSize
    
    // 5. Build where clause
    const where: any = {}
    
    // Search filter
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
        { code: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    
    // qrActive filter
    if (qrActive === 'true') {
      where.qrActive = true
    } else if (qrActive === 'false') {
      where.qrActive = false
    }
    
    // city filter
    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }
    
    // tier filter
    if (tier) {
      where.tier = tier
    }
    
    // suspended filter
    if (suspended === 'true') {
      where.user = { ...where.user, suspendedAt: { not: null } }
    } else if (suspended === 'false') {
      where.user = { ...where.user, suspendedAt: null }
    }
    
    // 6. Fetch mechanics and count in parallel
    const [mechanics, totalCount] = await Promise.all([
      prisma.mechanic.findMany({
        where,
        skip,
        take,
        include: {
          user: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mechanic.count({ where })
    ])
    
    // 7. Mask phone numbers for security in list view and add suspended status
    const maskedMechanics = mechanics.map(mechanic => ({
      id: mechanic.id,
      fullName: mechanic.user.fullName,
      phone: mechanic.user.phone ? 
        `${mechanic.user.phone.slice(0, 3)}***${mechanic.user.phone.slice(-2)}` : 
        'نامشخص',
      code: mechanic.code,
      qrActive: mechanic.qrActive,
      city: mechanic.city,
      tier: mechanic.tier,
      specialties: mechanic.specialties,
      suspended: !!(mechanic.user as any).suspendedAt,
      suspendedAt: (mechanic.user as any).suspendedAt,
      suspendReason: (mechanic.user as any).suspendReason,
      createdAt: mechanic.createdAt
    }))
    
    // 8. Log the action (without PII)
    logger.info({
      adminId: auth.id,
      searchTerm: search ? '***' : null,
      qrActiveFilter: qrActive,
      cityFilter: city,
      tierFilter: tier,
      suspendedFilter: suspended,
      page,
      pageSize,
      resultCount: maskedMechanics.length,
      totalCount,
      ip
    }, '[ADMIN MECHANICS LIST API] Mechanics list retrieved')
    
    // 9. Return response
    return {
      ok: true,
      items: maskedMechanics,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasMore: page < Math.ceil(totalCount / pageSize)
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
        statusMessage: 'Invalid query parameters',
        data: { errors: error.issues }
      })
    }
    
    logger.error({ err: error }, '[ADMIN MECHANICS LIST API] Error retrieving mechanics list')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while retrieving mechanics list'
    })
  }
})