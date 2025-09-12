// server/api/users/me/change-password.post.ts
import { prisma } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Schema برای اعتبارسنجی
const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'رمز عبور فعلی الزامی است'),
  newPassword: z.string().min(6, 'رمز عبور جدید باید حداقل 6 کاراکتر باشد').max(100, 'رمز عبور جدید نمی‌تواند بیش از 100 کاراکتر باشد')
})

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  try {
    // احراز هویت
    const auth = await requireAuth(event, ['MECHANIC', 'VENDOR', 'ADMIN'])
    
    logger.info('Change password request', { userId: auth.id })
    
    // خواندن body
    const body = await readBody(event)
    
    // اعتبارسنجی
    const validation = ChangePasswordSchema.safeParse(body)
    if (!validation.success) {
      logger.error('Change password validation failed', { 
        errors: validation.error.issues.map(e => e.message) 
      })
      throw createError({
        statusCode: 400,
        statusMessage: validation.error.issues[0]?.message || 'Invalid input'
      })
    }
    
    const { currentPassword, newPassword } = validation.data
    
    // بررسی اینکه رمز جدید با رمز فعلی متفاوت باشد
    if (currentPassword === newPassword) {
      logger.warn('New password same as current', { userId: auth.id })
      throw createError({
        statusCode: 400,
        statusMessage: 'رمز عبور جدید باید با رمز عبور فعلی متفاوت باشد'
      })
    }
    
    // دریافت کاربر و رمز عبور فعلی
    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        passwordHash: true,
        fullName: true
      }
    })
    
    if (!user) {
      logger.error('User not found', { userId: auth.id })
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // بررسی رمز عبور فعلی
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isCurrentPasswordValid) {
      logger.warn('Invalid current password', { userId: auth.id })
      throw createError({
        statusCode: 400,
        statusMessage: 'رمز عبور فعلی اشتباه است'
      })
    }
    
    // هش کردن رمز عبور جدید
    const newPasswordHash = await bcrypt.hash(newPassword, 12)
    
    // به‌روزرسانی رمز عبور و باطل کردن تمام نشست‌ها
    await prisma.$transaction(async (tx) => {
      // به‌روزرسانی رمز عبور
      await tx.user.update({
        where: { id: auth.id },
        data: {
          passwordHash: newPasswordHash,
          mustChangePassword: false // اگر کاربر مجبور به تغییر رمز بود، این فلگ را بردار
        }
      })
      
      // باطل کردن تمام نشست‌های فعال (refresh tokens)
      await tx.refreshToken.updateMany({
        where: {
          userId: auth.id,
          revokedAt: null
        },
        data: {
          revokedAt: new Date()
        }
      })
    })
    
    logger.info('Password changed successfully', { userId: auth.id })
    
    return {
      message: 'رمز عبور با موفقیت تغییر کرد',
      success: true
    }
    
  } catch (error: any) {
    logger.error('Change password failed', { 
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
