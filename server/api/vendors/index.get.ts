// server/api/vendors/index.get.ts
import { defineEventHandler, createError } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'
import logger from '~/server/utils/logger'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش ADMIN
    const auth = await requireAuth(event, ['ADMIN'])

    // دریافت تمام vendors
    const vendors = await prisma.vendor.findMany({
      select: {
        id: true,
        storeName: true
      },
      orderBy: {
        storeName: 'asc'
      }
    })

    // لاگ موفقیت
    logger.info({ count: vendors.length }, '[ADMIN VENDORS API] Vendors retrieved')

    return {
      items: vendors.map(v => ({
        id: v.id,
        name: v.storeName
      }))
    }

  } catch (error: any) {
    // لاگ خطا
    logger.error({ err: error }, '[ADMIN VENDORS API] Error')
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving vendors' 
    })
  }
})
