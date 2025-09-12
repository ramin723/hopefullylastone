// server/api/users/me/profile.ts
import { prisma } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'
import { z } from 'zod'

// Schema برای اعتبارسنجی PATCH
const UpdateProfileSchema = z.object({
  fullName: z.string().min(1, 'نام کامل الزامی است').max(100, 'نام کامل نمی‌تواند بیش از 100 کاراکتر باشد'),
  storeName: z.string().max(100, 'نام فروشگاه نمی‌تواند بیش از 100 کاراکتر باشد').optional(),
  city: z.string().max(50, 'شهر نمی‌تواند بیش از 50 کاراکتر باشد').optional(),
  specialties: z.string().max(200, 'تخصص‌ها نمی‌تواند بیش از 200 کاراکتر باشد').optional(),
  addressLine: z.string().max(200, 'آدرس نمی‌تواند بیش از 200 کاراکتر باشد').optional(),
  postalCode: z.string().max(10, 'کد پستی نمی‌تواند بیش از 10 کاراکتر باشد').optional(),
  province: z.string().max(50, 'استان نمی‌تواند بیش از 50 کاراکتر باشد').optional()
})

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  try {
    // احراز هویت
    const auth = await requireAuth(event, ['MECHANIC', 'VENDOR', 'ADMIN'])
    
    logger.info('Profile request', { userId: auth.id, role: auth.role })
    
    if (event.method === 'GET') {
      // دریافت اطلاعات پروفایل
      const user = await prisma.user.findUnique({
        where: { id: auth.id },
        select: {
          id: true,
          fullName: true,
          phone: true,
          role: true,
          createdAt: true,
          Mechanic: {
            select: {
              id: true,
              code: true,
              city: true,
              specialties: true,
              tier: true,
              qrActive: true
            }
          },
          Vendor: {
            select: {
              id: true,
              storeName: true,
              city: true,
              addressLine: true,
              postalCode: true,
              province: true,
              percentDefault: true,
              status: true,
              isActive: true
            }
          }
        }
      })
      
      if (!user) {
        logger.error('User not found', { userId: auth.id })
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found'
        })
      }
      
      // تعیین پروفایل بر اساس نقش
      let profile = null
      if (user.role === 'MECHANIC' && user.Mechanic) {
        profile = user.Mechanic
      } else if (user.role === 'VENDOR' && user.Vendor) {
        profile = user.Vendor
      }
      
      logger.info('Profile retrieved successfully', { userId: auth.id })
      
      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt
        },
        profile
      }
      
    } else if (event.method === 'PATCH') {
      // به‌روزرسانی پروفایل
      const body = await readBody(event)
      
      // اعتبارسنجی
      const validation = UpdateProfileSchema.safeParse(body)
      if (!validation.success) {
        logger.error('Profile update validation failed', { 
          errors: validation.error.issues.map(e => e.message) 
        })
        throw createError({
          statusCode: 400,
          statusMessage: validation.error.issues[0]?.message || 'Invalid input'
        })
      }
      
      const updateData = validation.data
      
      // به‌روزرسانی اطلاعات کاربر
      const updatedUser = await prisma.user.update({
        where: { id: auth.id },
        data: {
          fullName: updateData.fullName
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          role: true
        }
      })
      
      // به‌روزرسانی اطلاعات اختصاصی نقش
      if (auth.role === 'VENDOR') {
        await prisma.vendor.update({
          where: { userId: auth.id },
          data: {
            storeName: updateData.storeName || undefined,
            city: updateData.city || undefined,
            addressLine: updateData.addressLine || undefined,
            postalCode: updateData.postalCode || undefined,
            province: updateData.province || undefined
          }
        })
      } else if (auth.role === 'MECHANIC') {
        await prisma.mechanic.update({
          where: { userId: auth.id },
          data: {
            city: updateData.city || undefined,
            specialties: updateData.specialties || undefined
          }
        })
      }
      
      logger.info('Profile updated successfully', { userId: auth.id })
      
      return {
        user: updatedUser,
        message: 'Profile updated successfully'
      }
      
    } else {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      })
    }
    
  } catch (error: any) {
    logger.error('Profile operation failed', { 
      error: error.message,
      statusCode: error.statusCode 
    })
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
