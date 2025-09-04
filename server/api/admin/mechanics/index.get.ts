// server/api/admin/mechanics/index.get.ts
import { prisma } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../utils/rateLimiter'
import logger from '../../../utils/logger'
import { z } from 'zod'

// Query parameters validation
const QuerySchema = z.object({
  search: z.string().optional(),
  hasCode: z.enum(['true', 'false']).optional(),
  qrActive: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default(() => 1),
  pageSize: z.string().regex(/^\d+$/).transform(Number).default(() => 20)
})

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can list mechanics
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
    const validatedQuery = QuerySchema.parse(query)
    
    const { search, hasCode, qrActive, page, pageSize } = validatedQuery
    
    // 4. Build where clause
    const where: any = {}
    
    // Search filter
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
        { code: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // hasCode filter
    if (hasCode === 'true') {
      where.code = { not: null }
    } else if (hasCode === 'false') {
      where.code = null
    }
    
    // qrActive filter
    if (qrActive === 'true') {
      where.qrActive = true
    } else if (qrActive === 'false') {
      where.qrActive = false
    }
    
    // 5. Calculate pagination
    const skip = (page - 1) * pageSize
    const take = Math.min(pageSize, 100) // Max 100 items per page
    
    // 6. Execute queries in parallel
    const [mechanics, totalCount] = await Promise.all([
      prisma.mechanic.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          code: true,
          qrActive: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mechanic.count({ where })
    ])
    
    // 7. Mask phone numbers for security in list view
    const maskedMechanics = mechanics.map(mechanic => ({
      id: mechanic.id,
      fullName: mechanic.user.fullName,
      phone: mechanic.user.phone ? 
        `${mechanic.user.phone.slice(0, 3)}***${mechanic.user.phone.slice(-2)}` : 
        'نامشخص',
      code: mechanic.code,
      qrActive: mechanic.qrActive,
      createdAt: mechanic.createdAt
    }))
    
    // 8. Log the action (without PII)
    logger.info({
      adminId: auth.id,
      searchTerm: search ? '***' : null,
      hasCodeFilter: hasCode,
      qrActiveFilter: qrActive,
      page,
      pageSize,
      resultCount: mechanics.length,
      totalCount
    }, '[ADMIN MECHANICS LIST API] Mechanics list retrieved')
    
    // 9. Return response
    return {
      ok: true,
      items: maskedMechanics,
      count: totalCount,
      page,
      pageSize,
      hasMore: skip + mechanics.length < totalCount
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameters'
      })
    }
    
    logger.error({ err: error }, '[ADMIN MECHANICS LIST API] Error retrieving mechanics list')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while retrieving mechanics list'
    })
  }
})
