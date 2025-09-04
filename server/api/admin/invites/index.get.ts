/**
 * GET /api/admin/invites
 * 
 * Retrieve paginated list of invites with filtering options
 * 
 * Query Parameters:
 * - role: 'MECHANIC' | 'VENDOR' (optional) - Filter by user role
 * - phone: string (optional) - Search by phone number (partial match)
 * - status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED' (optional) - Filter by invite status
 *   - ACTIVE: Not used, not expired, not cancelled
 *   - USED: usedAt is not null
 *   - EXPIRED: Not used, expired (expiresAt <= now), not cancelled
 *   - CANCELLED: meta.cancelled = true
 * - page: number (default: 1) - Page number for pagination
 * - limit: number (default: 20) - Items per page
 * 
 * Response:
 * {
 *   "ok": true,
 *   "data": {
 *     "invites": [
 *       {
 *         "id": number,
 *         "role": "MECHANIC" | "VENDOR",
 *         "phone": "091***05", // masked
 *         "status": "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED",
 *         "expiresAt": "2024-01-01T00:00:00.000Z",
 *         "usedAt": null | "2024-01-01T00:00:00.000Z",
 *         "createdAt": "2024-01-01T00:00:00.000Z",
 *         "createdBy": {
 *           "id": number,
 *           "fullName": string,
 *           "phone": "091***05" // masked
 *         },
 *         "meta": object | null
 *       }
 *     ],
 *     "pagination": {
 *       "page": number,
 *       "limit": number,
 *       "total": number,
 *       "totalPages": number,
 *       "hasNext": boolean,
 *       "hasPrev": boolean
 *     }
 *   }
 * }
 * 
 * Security: Requires ADMIN role, includes CSRF protection
 */

// server/api/admin/invites/index.get.ts
import { prisma } from '../../../utils/db'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'
import { InviteListQuerySchema } from '../../../validators/invite'
import { getInviteStatus } from '../../../utils/invite'
import { maskPhone } from '../../../utils/rateLimiter'
import { requireAuth, requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Admin invite list request started')
  
  // Check authentication and admin role
  const user = await requireAuth(event)
  requireRole(user, 'ADMIN')
  
  const query = getQuery(event)
  
  // Validate query parameters
  const validation = InviteListQuerySchema.safeParse(query)
  if (!validation.success) {
    logger.error('Invite list query validation failed', { 
      errors: validation.error.issues.map((e: any) => e.message) 
    })
    throw createError({ 
      statusCode: 400, 
      statusMessage: validation.error.issues[0]?.message || 'Invalid query parameters' 
    })
  }
  
  const { role, phone, status, page, limit } = validation.data
  const skip = (page - 1) * limit
  
  logger.info('Admin invite list request allowed', {
    requestId,
    filters: { role, phone: phone ? maskPhone(phone) : null, status },
    pagination: { page, limit, skip }
  })
  
  // Debug: Log total invite count
  const totalCount = await prisma.invite.count()
  logger.info('Total invites in database', { requestId, totalCount })
  
  try {
    // Build where clause
    const where: any = {}
    
    if (role) {
      where.role = role
    }
    
    if (phone) {
      where.phone = {
        contains: phone
      }
    }
    
    if (status) {
      const now = new Date()
      switch (status) {
        case 'ACTIVE':
          where.usedAt = null
          where.expiresAt = { gt: now }
          // Exclude cancelled invites (those with meta.cancelled = true)
          where.OR = [
            { meta: null },
            { meta: { path: ['cancelled'], not: true } }
          ]
          break
        case 'USED':
          where.usedAt = { not: null }
          break
        case 'EXPIRED':
          where.usedAt = null
          where.expiresAt = { lte: now }
          // Exclude cancelled invites
          where.OR = [
            { meta: null },
            { meta: { path: ['cancelled'], not: true } }
          ]
          break
        case 'CANCELLED':
          where.meta = {
            path: ['cancelled'],
            equals: true
          }
          break
      }
    }
    
    // Debug: Log where clause
    logger.info('Where clause for invite query', { requestId, where })
    
    // Get invites with pagination
    const [invites, total] = await Promise.all([
      prisma.invite.findMany({
        where,
        include: {
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.invite.count({ where })
    ])
    
    // Transform invites for response (mask sensitive data)
    const transformedInvites = invites.map(invite => ({
      id: invite.id,
      role: invite.role,
      phone: maskPhone(invite.phone),
      status: getInviteStatus(invite),
      expiresAt: invite.expiresAt,
      usedAt: invite.usedAt,
      createdAt: invite.createdAt,
      createdBy: {
        id: invite.createdByUser.id,
        fullName: invite.createdByUser.fullName,
        phone: maskPhone(invite.createdByUser.phone)
      },
      meta: invite.meta
    }))
    
    const totalPages = Math.ceil(total / limit)
    
    logger.info('Admin invite list retrieved successfully', {
      requestId,
      total,
      returned: transformedInvites.length,
      page,
      totalPages
    })
    
    return {
      ok: true,
      data: {
        invites: transformedInvites,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    }
    
  } catch (error) {
    logger.error('Admin invite list request failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to retrieve invite list'
    })
  }
})
