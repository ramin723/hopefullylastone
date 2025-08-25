// server/api/mechanics/settlements/[id].get.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'
import { decimalToNumber } from '~/server/utils/decimal'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش
    const auth = await requireAuth(event, ['MECHANIC', 'ADMIN'])

    const settlementId = Number(getRouterParam(event, 'id'))
    if (!settlementId || isNaN(settlementId)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid settlement ID' })
    }

    // دریافت Settlement با تمام اطلاعات مرتبط
    const settlement = await prisma.settlement.findUnique({
      where: { id: settlementId },
      include: {
        vendor: { select: { storeName: true, city: true } },
        items: { 
          include: { 
            transaction: { 
              include: { 
                commission: true, 
                mechanic: { 
                  include: { 
                    user: true
                  } 
                },
                vendor: {
                  include: {
                    user: { select: { fullName: true } }
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

    // اگر کاربر مکانیک است، فقط تراکنش‌های خودش را ببیند
    let mechanicId: number | null = null
    if (auth.role === 'MECHANIC') {
      const mechanic = await prisma.mechanic.findUnique({ 
        where: { userId: auth.id },
        select: { id: true }
      })
      
      if (!mechanic) {
        throw createError({ statusCode: 403, statusMessage: 'Mechanic profile not found' })
      }
      
      mechanicId = mechanic.id
    }

    // فیلتر کردن items بر اساس mechanicId (اگر کاربر مکانیک است)
    let filteredItems = settlement.items
    if (mechanicId) {
      filteredItems = settlement.items.filter(item => 
        item.transaction.mechanicId === mechanicId
      )
      
      if (filteredItems.length === 0) {
        throw createError({ statusCode: 403, statusMessage: 'No transactions found for this mechanic in this settlement' })
      }
    }

    // محاسبه مجموع‌ها برای تراکنش‌های فیلتر شده
    const totals = {
      eligible: filteredItems.reduce((sum, item) => 
        sum + decimalToNumber(item.transaction.amountEligible), 0
      ),
      mechanic: filteredItems.reduce((sum, item) => 
        sum + decimalToNumber(item.mechanicAmount), 0
      ),
      platform: filteredItems.reduce((sum, item) => 
        sum + decimalToNumber(item.platformAmount), 0
      )
    }

    // لاگ موفقیت
    console.log(`[MECHANIC SETTLEMENT DETAIL API] Settlement ${settlementId} retrieved for user ${auth.id} with role ${auth.role}`)

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
      totals,
      status: settlement.status,
      createdAt: settlement.createdAt,
      paidAt: settlement.paidAt ?? null,
      items: filteredItems.map((item: any) => ({
        txId: item.transactionId,
        createdAt: item.transaction.createdAt,
        customerPhone: item.transaction.customerPhone,
        note: item.transaction.note,
        mechanic: {
          id: item.transaction.mechanicId,
          name: item.transaction.mechanic.user.fullName,
          code: item.transaction.mechanic.code
        },
        vendor: {
          id: item.transaction.vendorId,
          name: item.transaction.vendor.user.fullName,
          city: item.transaction.vendor.city
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
    console.error('Error retrieving mechanic settlement details:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving mechanic settlement details' 
    })
  }
})
