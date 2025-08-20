// server/api/vendors/[id]/settlements.get.ts
import { prisma } from '~/server/utils/db'
import { verify } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت
    const auth = getHeader(event, 'authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Missing token' })
    
    const payload = verify<{ userId: number; role: string }>(token)

    const vendorIdParam = Number(getRouterParam(event, 'id'))
    if (!vendorIdParam || isNaN(vendorIdParam)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid vendor ID' })
    }

    // بررسی دسترسی
    if (payload.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ 
        where: { userId: payload.userId },
        select: { id: true }
      })
      
      if (!vendor || vendor.id !== vendorIdParam) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied: You can only view your own settlements' })
      }
    } else if (payload.role !== 'ADMIN') {
      throw createError({ statusCode: 403, statusMessage: 'Access denied: Invalid role' })
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
    }) as Array<{
      id: number
      vendorId: number
      periodFrom: Date
      periodTo: Date
      totalAmountEligible: number
      totalMechanicAmount: number
      totalPlatformAmount: number
      status: string
      createdAt: Date
      paidAt: Date | null
      vendor: { storeName: string }
      _count: { items: number }
    }>

    // لاگ موفقیت
    console.log(`Settlements retrieved for vendor ${vendorExists.storeName}: ${settlements.length} records`)

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
      paidAt: s.paidAt ?? null,
      itemCount: s._count.items
    }))

  } catch (error: any) {
    // لاگ خطا
    console.error('Error retrieving settlements:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving settlements' 
    })
  }
})
