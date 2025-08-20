// server/api/settlements/[id]/mark-paid.post.ts
import { prisma } from '~/server/utils/db'
import { verify } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت
    const auth = getHeader(event, 'authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Missing token' })
    
    const payload = verify<{ userId: number; role: string }>(token)
    
    // بررسی نقش کاربر - فقط ADMIN
    if (payload.role !== 'ADMIN') {
      throw createError({ statusCode: 403, statusMessage: 'Access denied: Only ADMIN can mark settlements as paid' })
    }

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

    // لاگ موفقیت
    console.log(`Settlement ${id} marked as paid by admin ${payload.userId}`)

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
