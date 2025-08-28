// server/api/settlements/index.get.ts
import { defineEventHandler, createError, getQuery } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'
import { decimalToNumber } from '~/server/utils/decimal'
import logger from '~/server/utils/logger'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش ADMIN
    const auth = await requireAuth(event, ['ADMIN'])

    // دریافت query parameters
    const q = getQuery(event)
    const where: any = {}
    
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

    // صفحه‌بندی
    const page = Math.max(1, Number(q.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize) || 10))
    const skip = (page - 1) * pageSize

    // دریافت تعداد کل
    const count = await prisma.settlement.count({ where })

    // دریافت Settlement ها با صفحه‌بندی
    const settlements = await prisma.settlement.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: pageSize,
      include: {
        vendor: { select: { storeName: true } },
        items: { select: { transaction: { select: { mechanicId: true } } } }
      }
    })

    // لاگ موفقیت
    logger.info({ page, pageSize, count, returned: settlements.length }, '[ADMIN SETTLEMENTS API] Retrieved')

    return {
      items: settlements.map((s: any) => {
        const mechanicIds = new Set<number>()
        for (const it of s.items as any[]) {
          if (it?.transaction?.mechanicId) mechanicIds.add(it.transaction.mechanicId)
        }
        const uniqueMechanicId = mechanicIds.size === 1 ? Array.from(mechanicIds)[0] : null
        return {
          id: s.id,
          vendor: { 
            id: s.vendorId, 
            name: s.vendor.storeName
          },
          periodFrom: s.periodFrom,
          periodTo: s.periodTo,
          totals: {
            eligible: decimalToNumber(s.totalAmountEligible),
            mechanic: decimalToNumber(s.totalMechanicAmount),
            platform: decimalToNumber(s.totalPlatformAmount)
          },
          uniqueMechanicId,
          status: s.status,
          createdAt: s.createdAt,
          paidAt: s.paidAt
        }
      }),
      count,
      page,
      pageSize
    }

  } catch (error: any) {
    // لاگ خطا
    logger.error({ err: error }, '[ADMIN SETTLEMENTS API] Error')
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving settlements' 
    })
  }
})
