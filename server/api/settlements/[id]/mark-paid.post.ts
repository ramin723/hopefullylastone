// server/api/settlements/[id]/mark-paid.post.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'
import logger from '~/server/utils/logger'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش - فقط ADMIN
    const auth = await requireAuth(event, ['ADMIN'])

    const id = Number(getRouterParam(event, 'id'))
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid settlement ID' })
    }

    // بررسی وجود Settlement
    const existingSettlement = await prisma.settlement.findUnique({
      where: { id },
      select: { id: true, status: true, vendorId: true }
    })

    if (!existingSettlement) {
      throw createError({ statusCode: 404, statusMessage: 'Settlement not found' })
    }

    // بررسی وضعیت فعلی
    if (existingSettlement.status === 'PAID') {
      throw createError({ statusCode: 400, statusMessage: 'Settlement is already marked as paid' })
    }

    // عملیات اتمی: بروزرسانی Settlement و تغییر وضعیت تراکنش‌ها
    const updatedSettlement = await prisma.$transaction(async (tx) => {
      const updated = await tx.settlement.update({
        where: { id },
        data: { status: 'PAID', paidAt: new Date() }
      })

      const txIds = (await tx.settlementItem.findMany({
        where: { settlementId: id },
        select: { transactionId: true }
      })).map(i => i.transactionId)

      if (txIds.length) {
        await tx.transaction.updateMany({
          where: { id: { in: txIds } },
          data: { status: 'SETTLED' }
        })
      }

      return updated as any
    })

    // لاگ موفقیت
    logger.info({ id, adminId: auth.id }, '[MARK PAID API] Settlement marked as paid')

    return { 
      ok: true, 
      id: updatedSettlement.id, 
      status: updatedSettlement.status, 
      paidAt: updatedSettlement.paidAt 
    }

  } catch (error: any) {
    // لاگ خطا
    logger.error({ err: error, id: getRouterParam(event, 'id') }, 'Error marking settlement as paid')
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while marking settlement as paid' 
    })
  }
})
