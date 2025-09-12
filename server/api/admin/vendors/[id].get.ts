// server/api/admin/vendors/[id].get.ts
import { prisma } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { decimalToNumber } from '../../../utils/decimal'
import logger from '../../../utils/logger'

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can view vendor details
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Get vendor ID from URL
    const vendorId = parseInt(event.context.params.id)
    if (!vendorId || isNaN(vendorId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid vendor ID'
      })
    }
    
    // 3. Get comprehensive vendor data in parallel
    const [
      vendor,
      totalTransactions,
      totalSettlements,
      recentTransactions,
      recentSettlements,
      commissionStats
    ] = await Promise.all([
      // Vendor profile and user info
      prisma.vendor.findUnique({
        where: { id: vendorId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              status: true,
              suspendedAt: true,
              suspendReason: true,
              createdAt: true
            }
          }
        }
      }),
      
      // Total transactions count
      prisma.transaction.count({ 
        where: { vendorId } 
      }),
      
      // Total settlements count
      prisma.settlement.count({ 
        where: { vendorId } 
      }),
      
      // Recent 10 transactions
      prisma.transaction.findMany({
        where: { vendorId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          mechanic: {
            select: {
              id: true,
              code: true
            }
          },
          commission: {
            select: {
              mechanicAmount: true,
              platformAmount: true
            }
          }
        }
      }),
      
      // Recent 5 settlements
      prisma.settlement.findMany({
        where: { vendorId },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),
      
      // Commission stats from Commission table
      prisma.commission.aggregate({
        where: {
          transaction: {
            vendorId: vendorId
          }
        },
        _sum: {
          mechanicAmount: true,
          platformAmount: true
        }
      })
    ])
    
    // 4. Check if vendor exists
    if (!vendor) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Vendor not found'
      })
    }
    
    // 5. Calculate total commission
    const mechanicAmount = commissionStats._sum.mechanicAmount
    const platformAmount = commissionStats._sum.platformAmount
    const totalCommission = decimalToNumber(mechanicAmount) + decimalToNumber(platformAmount)
    
    // 6. Get total eligible amount from transactions
    const transactionStats = await prisma.transaction.aggregate({
      where: { vendorId },
      _sum: {
        amountEligible: true
      }
    })
    
    // 7. Return comprehensive response
    return {
      profile: {
        id: vendor.id,
        storeName: vendor.storeName,
        city: vendor.city,
        addressLine: vendor.addressLine,
        province: vendor.province,
        postalCode: vendor.postalCode,
        status: vendor.status,
        isActive: vendor.isActive,
        percentDefault: vendor.percentDefault,
        createdAt: vendor.createdAt,
        latitude: vendor.latitude,
        longitude: vendor.longitude
      },
      user: {
        id: vendor.user.id,
        fullName: vendor.user.fullName,
        phone: vendor.user.phone,
        status: vendor.user.status,
        suspended: !!vendor.user.suspendedAt,
        suspendedAt: vendor.user.suspendedAt,
        suspendReason: vendor.user.suspendReason,
        createdAt: vendor.user.createdAt
      },
      stats: {
        totalTransactions,
        totalSettlements,
        totalCommission,
        mechanicCommission: decimalToNumber(mechanicAmount),
        platformCommission: decimalToNumber(platformAmount),
        totalEligibleAmount: decimalToNumber(transactionStats._sum.amountEligible)
      },
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        mechanic: {
          id: tx.mechanic.id,
          name: tx.mechanic.code
        },
        customerPhone: tx.customerPhone,
        amountEligible: decimalToNumber(tx.amountEligible),
        status: tx.status,
        createdAt: tx.createdAt
      })),
      recentSettlements: recentSettlements.map(settlement => ({
        id: settlement.id,
        periodFrom: settlement.periodFrom,
        periodTo: settlement.periodTo,
        totalAmountEligible: decimalToNumber(settlement.totalAmountEligible),
        status: settlement.status,
        createdAt: settlement.createdAt
      }))
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error({ err: error }, '[ADMIN VENDOR DETAILS API] Error retrieving vendor details')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while retrieving vendor details'
    })
  }
})