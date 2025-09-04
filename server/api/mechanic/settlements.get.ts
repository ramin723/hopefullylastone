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
    const { status, from, to, page = '1', pageSize = '20' } = q
    
    // تبدیل pagination parameters
    const pageNum = parseInt(page as string) || 1
    const pageSizeNum = Math.min(parseInt(pageSize as string) || 20, 100) // حداکثر 100 آیتم در هر صفحه
    const skip = (pageNum - 1) * pageSizeNum

    const where: any = { 
      items: { 
        some: { 
          transaction: { mechanicId: mechanic.id } 
        } 
      } 
    }
    
    // فیلتر بر اساس status
    if (status && typeof status === 'string' && ['OPEN', 'PAID'].includes(status)) {
      where.status = status
    }

    // فیلتر بر اساس بازه تاریخ
    if (from && typeof from === 'string') {
      const fromDate = new Date(from)
      if (!isNaN(fromDate.getTime())) {
        where.periodFrom = { gte: fromDate }
      }
    }
    
    if (to && typeof to === 'string') {
      const toDate = new Date(to)
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999)
        where.periodTo = { lte: toDate }
      }
    }

    // دریافت تعداد کل تسویه‌ها (برای pagination)
    const totalCount = await prisma.settlement.count({ where })

    // دریافت Settlement ها که شامل تراکنش‌های این مکانیک هستند
    const settlements = await prisma.settlement.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: pageSizeNum,
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

    // محاسبه مجموع کل
    const totalEligible = settlementsWithTotals.reduce((sum, s) => sum + s.totals.eligible, 0)
    const totalMechanic = settlementsWithTotals.reduce((sum, s) => sum + s.totals.mechanic, 0)

    // ساخت response
    const result = {
      items: settlementsWithTotals,
      count: settlementsWithTotals.length,
      totalCount,
      totalEligible,
      totalMechanic,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore: skip + settlementsWithTotals.length < totalCount
    }

    return result

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
