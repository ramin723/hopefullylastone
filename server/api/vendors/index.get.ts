// server/api/vendors/index.get.ts
import { defineEventHandler, createError } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'

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
    console.log(`[ADMIN VENDORS API] Vendors retrieved: ${vendors.length} records`)

    return {
      items: vendors.map(v => ({
        id: v.id,
        name: v.storeName
      }))
    }

  } catch (error: any) {
    // لاگ خطا
    console.error('[ADMIN VENDORS API] Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving vendors' 
    })
  }
})
