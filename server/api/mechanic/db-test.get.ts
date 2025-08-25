// server/api/mechanic/db-test.get.ts
import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  console.log('[MECHANIC DB TEST API] Database test endpoint called')
  
  try {
    // تست اتصال به پایگاه داده
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('[MECHANIC DB TEST API] Database connection OK:', result)
    
    // تست شمارش کاربران
    const userCount = await prisma.user.count()
    console.log('[MECHANIC DB TEST API] User count:', userCount)
    
    // تست شمارش مکانیک‌ها
    const mechanicCount = await prisma.mechanic.count()
    console.log('[MECHANIC DB TEST API] Mechanic count:', mechanicCount)
    
    // تست شمارش تراکنش‌ها
    const transactionCount = await prisma.transaction.count()
    console.log('[MECHANIC DB TEST API] Transaction count:', transactionCount)
    
    return {
      message: 'Database test successful',
      database: 'Connected',
      userCount,
      mechanicCount,
      transactionCount,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('[MECHANIC DB TEST API] Database test failed:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'خطا در تست پایگاه داده: ' + (error.message || 'خطای نامشخص') 
    })
  }
})
