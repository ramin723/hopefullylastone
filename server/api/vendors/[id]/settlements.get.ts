// server/api/vendors/[id]/settlements.get.ts
import { defineEventHandler, createError, getQuery, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش
    const auth = await requireAuth(event, ['ADMIN', 'VENDOR'])

    const vendorIdParam = Number(getRouterParam(event, 'id'))
    if (!vendorIdParam || isNaN(vendorIdParam)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid vendor ID' })
    }

    // بررسی دسترسی VENDOR
    if (auth.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ 
        where: { userId: auth.id },
        select: { id: true }
      })
      
      if (!vendor || vendor.id !== vendorIdParam) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied: You can only view your own settlements' })
      }
    }

    // بررسی وجود Vendor
    const vendorExists = await prisma.vendor.findUnique({
      where: { id: vendorIdParam },
      select: { id: true, storeName: true }
    })
    
    if (!vendorExists) {
      throw createError({ statusCode: 404, statusMessage: 'Vendor not found' })
    }

    // دریافت query parameters
    const q = getQuery(event)
    const where: any = { vendorId: vendorIdParam }
    
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

    // دریافت Settlement ها
    const settlements = await prisma.settlement.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        vendor: { select: { storeName: true } },
        _count: { select: { items: true } }
      }
    })

    // لاگ موفقیت
    console.log(`[VENDOR SETTLEMENTS API] Settlements retrieved for vendor ${vendorExists.storeName}: ${settlements.length} records`)

    return settlements.map((s) => ({
      id: s.id,
      vendorId: s.vendorId,
      vendorName: s.vendor.storeName,
      periodFrom: s.periodFrom,
      periodTo: s.periodTo,
      totals: {
        eligible: s.totalAmountEligible,
        mechanic: s.totalMechanicAmount,
        platform: s.totalPlatformAmount
      },
      status: s.status,
      createdAt: s.createdAt,
      paidAt: s.paidAt,
      itemCount: s._count.items
    }))

  } catch (error: any) {
    console.error('[VENDOR SETTLEMENTS API] Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving settlements' 
    })
  }
})
