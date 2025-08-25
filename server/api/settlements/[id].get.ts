// server/api/settlements/[id].get.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'
import { decimalToNumber } from '~/server/utils/decimal'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش
    const auth = await requireAuth(event, ['ADMIN', 'VENDOR', 'MECHANIC'])

    const id = Number(getRouterParam(event, 'id'))
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid settlement ID' })
    }

    // دریافت Settlement با تمام اطلاعات مرتبط
    const settlement = await prisma.settlement.findUnique({
      where: { id },
      include: {
        vendor: true,
        items: { 
          include: { 
            transaction: { 
              include: { 
                commission: true, 
                mechanic: { 
                  include: { 
                    user: true
                  } 
                } 
              } 
            } 
          } 
        }
      }
    })

    if (!settlement) {
      throw createError({ statusCode: 404, statusMessage: 'Settlement not found' })
    }

    // بررسی مجوز دسترسی برای VENDOR
    if (auth.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ 
        where: { userId: auth.id },
        select: { id: true }
      })
      
      if (!vendor || vendor.id !== settlement.vendorId) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied: You can only view your own settlements' })
      }
    }

    // بررسی مجوز دسترسی برای MECHANIC
    if (auth.role === 'MECHANIC') {
      const mechanic = await prisma.mechanic.findUnique({ 
        where: { userId: auth.id },
        select: { id: true }
      })
      
      if (!mechanic) {
        throw createError({ statusCode: 403, statusMessage: 'Mechanic profile not found' })
      }
      
      // بررسی اینکه این تسویه شامل تراکنش‌های این مکانیک باشد
      const hasAccess = settlement.items.some(item => 
        item.transaction.mechanicId === mechanic.id
      )
      
      if (!hasAccess) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied: This settlement does not contain your transactions' })
      }
    }

    // لاگ موفقیت
    console.log(`[SETTLEMENT DETAIL API] Settlement ${id} retrieved for user ${auth.id} with role ${auth.role}`)

    // بازگرداندن داده‌ها - Decimal-safe
    return {
      id: settlement.id,
      vendor: { 
        id: settlement.vendorId, 
        name: settlement.vendor.storeName,
        city: settlement.vendor.city
      },
      periodFrom: settlement.periodFrom,
      periodTo: settlement.periodTo,
      totals: {
        eligible: decimalToNumber(settlement.totalAmountEligible),
        mechanic: decimalToNumber(settlement.totalMechanicAmount),
        platform: decimalToNumber(settlement.totalPlatformAmount)
      },
      status: settlement.status,
      createdAt: settlement.createdAt,
      paidAt: settlement.paidAt ?? null,
      items: settlement.items.map((item: any) => ({
        txId: item.transactionId,
        createdAt: item.transaction.createdAt,
        customerPhone: item.transaction.customerPhone,
        note: item.transaction.note,
        mechanic: {
          id: item.transaction.mechanicId,
          name: item.transaction.mechanic.user.fullName,
          code: item.transaction.mechanic.code
        },
        amounts: {
          total: decimalToNumber(item.transaction.amountTotal),
          eligible: decimalToNumber(item.transaction.amountEligible),
          mechanic: decimalToNumber(item.mechanicAmount),
          platform: decimalToNumber(item.platformAmount)
        },
        commission: item.transaction.commission ? {
          rateMechanic: item.transaction.commission.rateMechanic,
          ratePlatform: item.transaction.commission.ratePlatform
        } : null
      }))
    }

  } catch (error: any) {
    // لاگ خطا
    console.error('Error retrieving settlement details:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving settlement details' 
    })
  }
})
