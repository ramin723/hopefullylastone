// server/api/admin/debug/user-by-phone.get.ts
import { prisma } from '../../../utils/db'
import { createRequestLogger } from '../../../utils/logger'
import { randomUUID } from 'crypto'
import { requireAuth, requireRole } from '../../../utils/auth'
import { normalizePhone } from '../../../utils/otp'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Admin debug user-by-phone request started')
  
  // Check authentication and admin role
  const user = await requireAuth(event)
  requireRole(user, 'ADMIN')
  
  // Get phone from query
  const query = getQuery(event)
  const phone = query.phone as string
  
  if (!phone) {
    logger.error('Admin debug user-by-phone missing phone parameter', {
      requestId,
      adminId: user.id
    })
    throw createError({
      statusCode: 400,
      statusMessage: 'Phone parameter is required'
    })
  }
  
  try {
    // Normalize phone
    const normalizedPhone = normalizePhone(phone)
    
    logger.info('Admin debug user-by-phone search started', {
      requestId,
      adminId: user.id,
      searchPhone: normalizedPhone
    })
    
    // Find user by phone
    const foundUser = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone
      },
      select: {
        id: true,
        role: true,
        phone: true,
        mustChangePassword: true,
        passwordHash: true,
        createdAt: true,
        refreshTokens: {
          select: {
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
          }
        }
      })
    
    if (!foundUser) {
      logger.warn('Admin debug user-by-phone user not found', {
        requestId,
        adminId: user.id,
        searchPhone: normalizedPhone
      })
      
      return {
        ok: true,
        user: null,
        note: "User not found - no PII beyond masked"
      }
    }
    
    // Mask phone
    const maskedPhone = foundUser.phone.replace(/^(\d{4})\d+(\d{4})$/, '$1***$2')
    
    // Check if user has password
    const hasPassword = foundUser.passwordHash && foundUser.passwordHash.length > 0
    
    // Get last login time
    const lastLoginAt = foundUser.refreshTokens.length > 0 
      ? foundUser.refreshTokens[0]?.createdAt 
      : null
    
    const result = {
      ok: true,
      user: {
        id: foundUser.id,
        role: foundUser.role,
        phone: maskedPhone,
        mustChangePassword: foundUser.mustChangePassword,
        hasPassword,
        createdAt: foundUser.createdAt,
        lastLoginAt
      },
      note: "no PII beyond masked"
    }
    
    logger.info('Admin debug user-by-phone completed', {
      requestId,
      adminId: user.id,
      foundUserId: foundUser.id,
      foundUserRole: foundUser.role,
      mustChangePassword: foundUser.mustChangePassword,
      hasPassword
    })
    
    return result
    
  } catch (error: any) {
    logger.error('Admin debug user-by-phone failed', {
      requestId,
      adminId: user.id,
      searchPhone: phone,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})

