// server/api/settlements/[id]/mark-paid.post.ts
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'

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

    // بروزرسانی Settlement
    const updatedSettlement = await prisma.settlement.update({
      where: { id },
      data: { 
        status: 'PAID', 
        paidAt: new Date() 
      }
    }) as any

    // تغییر وضعیت تراکنش‌های مرتبط به SETTLED
    await prisma.transaction.updateMany({
      where: {
        id: {
          in: (await prisma.settlementItem.findMany({
            where: { settlementId: id },
            select: { transactionId: true }
          })).map(item => item.transactionId)
        }
      },
      data: { status: 'SETTLED' }
    })

    // لاگ موفقیت
    console.log(`[MARK PAID API] Settlement ${id} marked as paid by admin ${auth.id}`)

    return { 
      ok: true, 
      id: updatedSettlement.id, 
      status: updatedSettlement.status, 
      paidAt: updatedSettlement.paidAt 
    }

  } catch (error: any) {
    // لاگ خطا
    console.error('Error marking settlement as paid:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while marking settlement as paid' 
    })
  }
})
