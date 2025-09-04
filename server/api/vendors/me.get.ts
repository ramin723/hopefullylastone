// server/api/vendors/me.get.ts
import { defineEventHandler, createError } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش VENDOR
    const auth = await requireAuth(event, ['VENDOR'])

    // دریافت vendor اطلاعات
    const vendor = await prisma.vendor.findUnique({
      where: { userId: auth.id },
      select: {
        id: true,
        storeName: true,
        city: true,
        percentDefault: true,
        status: true,
        createdAt: true
      }
    })

    if (!vendor) {
      throw createError({ statusCode: 404, statusMessage: 'Vendor not found' })
    }

    // PROD: Success logging removed for production

    return vendor

  } catch (error: any) {
    console.error('[VENDOR ME API] Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving vendor info' 
    })
  }
})
