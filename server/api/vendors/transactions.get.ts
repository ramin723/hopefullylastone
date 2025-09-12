// server/api/vendors/transactions.get.ts
import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../utils/rateLimiter'
import logger from '../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only VENDOR can view their transactions
    const auth = await requireAuth(event, ['VENDOR'])
    
    // 2. Rate limiting - 50 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `vendor.transactions:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 50
    })
    
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests'
      })
    }
    
    // 3. Get vendor ID from auth
    const vendor = await prisma.vendor.findUnique({
      where: { userId: auth.id },
      select: { id: true }
    })
    
    if (!vendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vendor not found'
      })
    }
    
    // 4. Parse query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 20
    const search = query.search as string
    const status = query.status as string
    
    // 5. Build where clause
    const where: any = {
      vendorId: vendor.id
    }
    
    if (search) {
      where.OR = [
        { customerPhone: { contains: search } },
        { note: { contains: search } },
        { mechanic: { user: { fullName: { contains: search } } } }
      ]
    }
    
    if (status) {
      where.status = status
    }
    
    // 6. Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          mechanic: {
            select: {
              code: true,
              user: {
                select: {
                  fullName: true
                }
              }
            }
          },
          commission: {
            select: {
              mechanicAmount: true,
              platformAmount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      
      prisma.transaction.count({ where })
    ])
    
    // 7. Format transactions for response
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      createdAt: transaction.createdAt,
      customerPhone: transaction.customerPhone,
      amountTotal: transaction.amountTotal,
      amountEligible: transaction.amountEligible,
      status: transaction.status,
      note: transaction.note,
      mechanicName: transaction.mechanic.user.fullName,
      mechanicCode: transaction.mechanic.code,
      mechanicCommission: transaction.commission?.mechanicAmount || 0,
      platformCommission: transaction.commission?.platformAmount || 0,
      totalCommission: Number(transaction.commission?.mechanicAmount || 0) + Number(transaction.commission?.platformAmount || 0)
    }))
    
    // 8. Log successful retrieval
    logger.info({
      vendorId: vendor.id,
      userId: auth.id,
      page,
      pageSize,
      totalCount,
      search,
      status
    }, '[VENDOR TRANSACTIONS API] Transactions retrieved')
    
    // 9. Return response
    return {
      ok: true,
      data: formattedTransactions,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page < Math.ceil(totalCount / pageSize),
        hasPrevPage: page > 1
      }
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[VENDOR TRANSACTIONS API] Error retrieving transactions')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while retrieving transactions'
    })
  }
})
