// server/api/vendors/settlements.get.ts
import { defineEventHandler, createError, getQuery } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'
import { decimalToNumber } from '~/server/utils/decimal'
import logger from '~/server/utils/logger'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش
    const auth = await requireAuth(event, ['VENDOR'])

    // دریافت پروفایل فروشگاه
    const vendor = await prisma.vendor.findUnique({ 
      where: { userId: auth.id },
      select: { id: true, storeName: true }
    })
    
    if (!vendor) {
      throw createError({ statusCode: 404, statusMessage: 'Vendor profile not found' })
    }

    // دریافت query parameters
    const q = getQuery(event)
    const { status, from, to, page = '1', pageSize = '20' } = q
    
    // تبدیل pagination parameters
    const pageNum = parseInt(page as string) || 1
    const pageSizeNum = Math.min(parseInt(pageSize as string) || 20, 100) // حداکثر 100 آیتم در هر صفحه
    const skip = (pageNum - 1) * pageSizeNum

    const where: any = { vendorId: vendor.id }
    
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
    logger.info({ vendorId: vendor.id, totalCount }, '[VENDOR SETTLEMENTS API] Total count')

    // دریافت Settlement ها با pagination
    const settlements = await prisma.settlement.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: pageSizeNum,
      include: {
        vendor: { select: { storeName: true } },
        _count: { select: { items: true } }
      }
    })

    // محاسبه مجموع کل
    const totalEligible = settlements.reduce((sum, s) => sum + decimalToNumber(s.totalAmountEligible), 0)
    const totalMechanic = settlements.reduce((sum, s) => sum + decimalToNumber(s.totalMechanicAmount), 0)

    // ساخت response
    const result = {
      items: settlements.map((s) => ({
        id: s.id,
        vendorId: s.vendorId,
        vendorName: s.vendor.storeName,
        periodFrom: s.periodFrom,
        periodTo: s.periodTo,
        totals: {
          eligible: decimalToNumber(s.totalAmountEligible),
          mechanic: decimalToNumber(s.totalMechanicAmount),
          platform: decimalToNumber(s.totalPlatformAmount)
        },
        status: s.status,
        createdAt: s.createdAt,
        paidAt: s.paidAt,
        itemCount: s._count.items
      })),
      count: settlements.length,
      totalCount,
      totalEligible,
      totalMechanic,
      page: pageNum,
      pageSize: pageSizeNum,
      hasMore: skip + settlements.length < totalCount
    }

    // لاگ موفقیت
    logger.info({ 
      vendorId: vendor.id, 
      count: result.count,
      totalCount: result.totalCount,
      totalEligible: result.totalEligible,
      totalMechanic: result.totalMechanic,
      page: result.page,
      pageSize: result.pageSize,
      hasMore: result.hasMore
    }, '[VENDOR SETTLEMENTS API] Settlements retrieved')

    return result

  } catch (error: any) {
    logger.error({ err: error }, '[VENDOR SETTLEMENTS API] Error')
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving settlements' 
    })
  }
})
