// server/api/settlements/[id].get.ts
import { prisma } from '~/server/utils/db'
import { verify } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت
    const auth = getHeader(event, 'authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Missing token' })
    
    const payload = verify<{ userId: number; role: string }>(token)

    const id = Number(getRouterParam(event, 'id'))
    if (!id || isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid settlement ID' })
    }

    // دریافت Settlement با تمام اطلاعات مرتبط
    const settlement = await prisma.settlement.findUnique({
      where: { id },
      include: {
        vendor: true,
        items: { 
          include: { 
            transaction: { 
              include: { 
                commission: true, 
                mechanic: { 
                  include: { 
                    user: true
                  } 
                } 
              } 
            } 
          } 
        }
      }
    }) as any

    if (!settlement) {
      throw createError({ statusCode: 404, statusMessage: 'Settlement not found' })
    }

    // بررسی مجوز دسترسی برای VENDOR
    if (payload.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ 
        where: { userId: payload.userId },
        select: { id: true }
      })
      
      if (!vendor || vendor.id !== settlement.vendorId) {
        throw createError({ statusCode: 403, statusMessage: 'Access denied: You can only view your own settlements' })
      }
    } else if (payload.role !== 'ADMIN') {
      throw createError({ statusCode: 403, statusMessage: 'Access denied: Invalid role' })
    }

    // لاگ موفقیت
    console.log(`Settlement ${id} retrieved for user ${payload.userId} with role ${payload.role}`)

    // بازگرداندن داده‌ها
    return {
      id: settlement.id,
      vendor: { 
        id: settlement.vendorId, 
        name: settlement.vendor.storeName,
        city: settlement.vendor.city
      },
      periodFrom: settlement.periodFrom,
      periodTo: settlement.periodTo,
      totals: {
        eligible: settlement.totalAmountEligible,
        mechanic: settlement.totalMechanicAmount,
        platform: settlement.totalPlatformAmount
      },
      status: settlement.status,
      createdAt: settlement.createdAt,
      paidAt: settlement.paidAt ?? null,
      items: settlement.items.map((item: any) => ({
        txId: item.transactionId,
        createdAt: item.transaction.createdAt,
        customerPhone: item.transaction.customerPhone,
        note: item.transaction.note,
        mechanic: {
          id: item.transaction.mechanicId,
          name: item.transaction.mechanic.user.fullName,
          code: item.transaction.mechanic.code
        },
        amounts: {
          total: item.transaction.amountTotal,
          eligible: item.transaction.amountEligible,
          mechanic: item.mechanicAmount,
          platform: item.platformAmount
        },
        commission: item.transaction.commission ? {
          rateMechanic: item.transaction.commission.rateMechanic,
          ratePlatform: item.transaction.commission.ratePlatform
        } : null
      }))
    }

  } catch (error: any) {
    // لاگ خطا
    console.error('Error retrieving settlement details:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving settlement details' 
    })
  }
})
