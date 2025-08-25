// server/api/vendors/[id]/transactions.get.ts
import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const auth = await requireAuth(event, ['ADMIN', 'VENDOR'])
    
    const vendorIdParam = Number(getRouterParam(event, 'id'))
    if (!vendorIdParam || isNaN(vendorIdParam)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid vendor ID' })
    }

    // اگر نقش VENDOR است، فقط اجازه بده id صفحه با vendor خودش یکی باشد
    if (auth.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: auth.id } })
      if (!vendor || vendor.id !== vendorIdParam) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied: You can only view your own transactions' })
      }
    }

    const q = getQuery(event)
    const where: any = { vendorId: vendorIdParam }
    if (q.status && typeof q.status === 'string') where.status = q.status
    if (q.from || q.to) {
      where.createdAt = {}
      if (q.from && typeof q.from === 'string') where.createdAt.gte = new Date(q.from as string)
      if (q.to && typeof q.to === 'string') where.createdAt.lte = new Date(q.to as string)
    }

    const rows = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { commission: true, mechanic: { include: { user: true } } }
    })

    // لاگ موفقیت
    console.log(`[VENDOR TRANSACTIONS API] Transactions retrieved for vendor ${vendorIdParam}: ${rows.length} records`)

    return rows.map((tx) => ({
      id: tx.id,
      createdAt: tx.createdAt,
      status: tx.status,
      mechanic: { id: tx.mechanicId, name: tx.mechanic.user.fullName, code: tx.mechanic.code },
      amounts: {
        total: tx.amountTotal,
        eligible: tx.amountTotal,
        commission: {
          mechanic: tx.commission?.mechanicAmount ?? 0,
          platform: tx.commission?.platformAmount ?? 0
        }
      }
    }))

  } catch (error: any) {
    console.error('[VENDOR TRANSACTIONS API] Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving transactions' 
    })
  }
})
