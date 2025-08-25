// server/api/mechanic/settlements.get.ts
import { defineEventHandler, createError, getQuery } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'
import { decimalToNumber } from '~/server/utils/decimal'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش
    const auth = await requireAuth(event, ['MECHANIC'])

    // دریافت پروفایل مکانیک
    const mechanic = await prisma.mechanic.findUnique({
      where: { userId: auth.id },
      select: { id: true }
    })
    
    if (!mechanic) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Mechanic profile not found' 
      })
    }

    // دریافت query parameters
    const q = getQuery(event)
    const where: any = { 
      items: { 
        some: { 
          transaction: { mechanicId: mechanic.id } 
        } 
      } 
    }
    
    // فیلتر بر اساس status
    if (q.status && typeof q.status === 'string' && ['OPEN', 'PAID'].includes(q.status)) {
      where.status = q.status
    }

    // فیلتر بر اساس بازه تاریخ
    if (q.from && typeof q.from === 'string') {
      const fromDate = new Date(q.from)
      if (!isNaN(fromDate.getTime())) {
        where.periodFrom = { gte: fromDate }
      }
    }
    
    if (q.to && typeof q.to === 'string') {
      const toDate = new Date(q.to)
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999)
        where.periodTo = { lte: toDate }
      }
    }

    // دریافت Settlement ها که شامل تراکنش‌های این مکانیک هستند
    const settlements = await prisma.settlement.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        vendor: { select: { storeName: true, city: true } },
        items: {
          where: { transaction: { mechanicId: mechanic.id } },
          include: {
            transaction: { 
              select: { 
                id: true, 
                createdAt: true, 
                mechanicId: true, 
                amountEligible: true 
              } 
            }
          }
        },
        _count: { 
          select: { 
            items: { 
              where: { transaction: { mechanicId: mechanic.id } } 
            } 
          } 
        }
      }
    })

    // محاسبه مجموع‌ها برای هر تسویه (فقط تراکنش‌های این مکانیک)
    const settlementsWithTotals = settlements.map((s) => {
      const mechanicItems = s.items.filter(item => 
        item.transaction.mechanicId === mechanic.id
      )
      
      const totals = {
        eligible: mechanicItems.reduce((sum, item) => 
          sum + decimalToNumber(item.transaction.amountEligible), 0
        ),
        mechanic: mechanicItems.reduce((sum, item) => 
          sum + decimalToNumber(item.mechanicAmount), 0
        ),
        platform: mechanicItems.reduce((sum, item) => 
          sum + decimalToNumber(item.platformAmount), 0
        )
      }

      return {
        id: s.id,
        vendorId: s.vendorId,
        vendorName: s.vendor.storeName,
        vendorCity: s.vendor.city,
        periodFrom: s.periodFrom,
        periodTo: s.periodTo,
        totals,
        status: s.status,
        createdAt: s.createdAt,
        paidAt: s.paidAt,
        itemCount: s._count.items
      }
    })

    // لاگ موفقیت
    console.log(`[MECHANIC SETTLEMENTS API] Settlements retrieved for mechanic ${mechanic.id}: ${settlementsWithTotals.length} records`)

    return settlementsWithTotals

  } catch (error: any) {
    console.error('[MECHANIC SETTLEMENTS API] Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving mechanic settlements' 
    })
  }
})
