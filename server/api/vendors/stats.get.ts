// server/api/vendors/stats.get.ts
import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../utils/rateLimiter'
import logger from '../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only VENDOR can view their stats
    const auth = await requireAuth(event, ['VENDOR'])
    
    // 2. Rate limiting - 100 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `vendor.stats:${ip}:${auth.id}`
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
    
    // 4. Parse query parameters for time period
    const query = getQuery(event)
    const period = query.period as string || 'monthly'
    const from = query.from as string
    const to = query.to as string
    
    // 5. Calculate date range based on period or custom dates
    let dateFrom: Date
    let dateTo: Date = new Date()
    
    if (from && to) {
      dateFrom = new Date(from)
      dateTo = new Date(to)
    } else {
      switch (period) {
        case 'weekly':
          dateFrom = new Date()
          dateFrom.setDate(dateFrom.getDate() - 7)
          break
        case 'monthly':
          dateFrom = new Date()
          dateFrom.setMonth(dateFrom.getMonth() - 1)
          break
        case 'yearly':
          dateFrom = new Date()
          dateFrom.setFullYear(dateFrom.getFullYear() - 1)
          break
        default:
          dateFrom = new Date()
          dateFrom.setMonth(dateFrom.getMonth() - 1)
      }
    }
    
    // 6. Build where clause for time filtering
    const timeFilter = {
      vendorId: vendor.id,
      createdAt: {
        gte: dateFrom,
        lte: dateTo
      }
    }
    
    // 7. Execute all queries in parallel for optimal performance
    const [
      kpisResult,
      commissionResult,
      mechanicsCountResult,
      salesOverTimeResult,
      topMechanicsResult,
      recentTransactionsResult
    ] = await Promise.all([
      // KPIs - Single query with multiple aggregations
      prisma.transaction.aggregate({
        where: timeFilter,
        _count: { id: true },
        _sum: { 
          amountTotal: true,
          amountEligible: true
        }
      }),
      
      // Commission totals
      prisma.commission.aggregate({
        where: { 
          transaction: timeFilter
        },
        _sum: { 
          mechanicAmount: true,
          platformAmount: true
        }
      }),
      
      // Unique mechanics count
      prisma.transaction.groupBy({
        by: ['mechanicId'],
        where: timeFilter,
        _count: { mechanicId: true }
      }),
      
      // Sales over time - Daily aggregation
      prisma.transaction.groupBy({
        by: ['createdAt'],
        where: timeFilter,
        _sum: { amountTotal: true },
        orderBy: { createdAt: 'asc' }
      }),
      
      // Top mechanics by commission
      prisma.commission.findMany({
        where: { 
          transaction: timeFilter
        },
        include: {
          transaction: {
            include: {
              mechanic: {
                include: {
                  user: {
                    select: { fullName: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { mechanicAmount: 'desc' },
        take: 5
      }),
      
      // Recent transactions
      prisma.transaction.findMany({
        where: timeFilter,
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
        take: 10
      })
    ])
    
    // 8. Process sales over time data
    const salesOverTime = salesOverTimeResult.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      amount: Number(item._sum.amountTotal || 0)
    }))
    
    // 9. Process top mechanics data
    const topMechanics = topMechanicsResult.map(item => ({
      name: item.transaction.mechanic.user.fullName,
      totalCommission: Number(item.mechanicAmount)
    }))
    
    // 10. Process recent transactions
    const recentTransactions = recentTransactionsResult.map(transaction => ({
      id: transaction.id,
      createdAt: transaction.createdAt,
      mechanicName: transaction.mechanic.user.fullName,
      mechanicCode: transaction.mechanic.code,
      amountTotal: transaction.amountTotal,
      mechanicCommission: transaction.commission?.mechanicAmount || 0,
      platformCommission: transaction.commission?.platformAmount || 0,
      totalCommission: Number(transaction.commission?.mechanicAmount || 0) + Number(transaction.commission?.platformAmount || 0)
    }))
    
    // 11. Calculate KPIs
    const totalSales = Number(kpisResult._sum.amountTotal || 0)
    const totalEligibleAmount = Number(kpisResult._sum.amountEligible || 0)
    const totalCommission = Number(commissionResult._sum?.mechanicAmount || 0) + Number(commissionResult._sum?.platformAmount || 0)
    const mechanicCount = mechanicsCountResult.length
    
    // 12. Log successful retrieval
    logger.info({
      vendorId: vendor.id,
      userId: auth.id,
      period,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      totalSales,
      mechanicCount
    }, '[VENDOR STATS API] Advanced stats retrieved')
    
    // 13. Return comprehensive response
    return {
      ok: true,
      period: {
        type: period,
        from: dateFrom.toISOString(),
        to: dateTo.toISOString()
      },
      kpis: {
        totalSales,
        totalEligibleAmount,
        totalCommission,
        mechanicCount
      },
      chartsData: {
        salesOverTime,
        topMechanics
      },
      recentTransactions
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[VENDOR STATS API] Error retrieving advanced stats')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while retrieving stats'
    })
  }
})
