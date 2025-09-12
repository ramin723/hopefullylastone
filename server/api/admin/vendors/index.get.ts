// server/api/admin/vendors/index.get.ts
import { prisma } from '../../../utils/db'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'
import { requireAuth, requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Admin vendors list request started')
  
  // Check authentication and admin role
  const user = await requireAuth(event)
  requireRole(user, 'ADMIN')
  
  const query = getQuery(event)
  const search = query.search as string || ''
  const status = query.status as string || ''
  const suspended = query.suspended as string || ''
  const page = parseInt(query.page as string) || 1
  const pageSize = parseInt(query.pageSize as string) || 20
  const skip = (page - 1) * pageSize
  
  logger.info('Admin vendors list request allowed', {
    requestId,
    filters: { search, status, suspended },
    pagination: { page, pageSize, skip }
  })
  
  try {
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { storeName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { user: { phone: { contains: search } } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } }
      ]
    }
    
    if (status) {
      where.status = status
    }
    
    if (suspended) {
      if (suspended === 'true') {
        where.user = { ...where.user, suspendedAt: { not: null } }
      } else if (suspended === 'false') {
        where.user = { ...where.user, suspendedAt: null }
      }
    }
    
    // Get vendors with pagination
    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              status: true,
              suspendedAt: true,
              suspendReason: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.vendor.count({ where })
    ])
    
    // Transform vendors for response
    const transformedVendors = vendors.map(vendor => ({
      id: vendor.id,
      storeName: vendor.storeName,
      city: vendor.city,
      status: vendor.status,
      createdAt: vendor.createdAt,
      fullName: vendor.user.fullName,
      phone: vendor.user.phone,
      userStatus: vendor.user.status,
      suspended: !!vendor.user.suspendedAt,
      suspendedAt: vendor.user.suspendedAt,
      suspendReason: vendor.user.suspendReason
    }))
    
    logger.info('Admin vendors list retrieved successfully', {
      requestId,
      total,
      returned: transformedVendors.length,
      page,
      pageSize
    })
    
    return {
      items: transformedVendors,
      count: total
    }
    
  } catch (error) {
    logger.error('Admin vendors list request failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to retrieve vendors list'
    })
  }
})
