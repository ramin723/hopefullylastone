// server/api/auth/refresh.post.ts
import { prisma } from '../../utils/db'
import { generateAccessToken, generateRefreshToken, hashRefreshToken, getRefreshTokenExpiry, verifyAccessToken } from '../../utils/tokens'
import { createRequestLogger } from '../../utils/logger'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Token refresh attempt started')
  
  // Get refresh token from cookie
  const refreshToken = getCookie(event, 'rt')
  if (!refreshToken) {
    logger.error('Refresh failed: no refresh token in cookie')
    throw createError({ statusCode: 401, statusMessage: 'No refresh token' })
  }
  
  // Hash the refresh token to compare with database
  const refreshTokenHash = hashRefreshToken(refreshToken)
  
  // Find refresh token in database
  const dbRefreshToken = await prisma.refreshToken.findFirst({
    where: { tokenHash: refreshTokenHash },
    include: { user: true }
  })
  
  if (!dbRefreshToken) {
    logger.error('Refresh failed: refresh token not found in database')
    throw createError({ statusCode: 401, statusMessage: 'Invalid refresh token' })
  }
  
  if (dbRefreshToken.revokedAt) {
    logger.error('Refresh failed: refresh token already revoked', { userId: dbRefreshToken.userId })
    throw createError({ statusCode: 401, statusMessage: 'Refresh token revoked' })
  }
  
  if (dbRefreshToken.expiresAt < new Date()) {
    logger.error('Refresh failed: refresh token expired', { userId: dbRefreshToken.userId })
    throw createError({ statusCode: 401, statusMessage: 'Refresh token expired' })
  }
  
  // Revoke old refresh token
  await prisma.refreshToken.update({
    where: { id: dbRefreshToken.id },
    data: { revokedAt: new Date() }
  })
  
  // Generate new tokens
  const newAccessToken = generateAccessToken({
    userId: dbRefreshToken.user.id,
    role: dbRefreshToken.user.role,
    phone: dbRefreshToken.user.phone
  })
  
  const newRefreshToken = generateRefreshToken()
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken)
  const newExpiresAt = getRefreshTokenExpiry()
  
  // Save new refresh token
  await prisma.refreshToken.create({
    data: {
      userId: dbRefreshToken.user.id,
      tokenHash: newRefreshTokenHash,
      userAgent: dbRefreshToken.userAgent,
      ip: dbRefreshToken.ip,
      expiresAt: newExpiresAt
    }
  })
  
  // Set new cookies
  const isProd = process.env.NODE_ENV === 'production'
  
  setCookie(event, 'at', newAccessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,      // ← DEV: false  |  PROD: true
    path: '/',
    maxAge: 60 * 15      // 15m
  })
  
  setCookie(event, 'rt', newRefreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,      // ← DEV: false  |  PROD: true
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30d
  })
  
  logger.info('Token refresh successful', { userId: dbRefreshToken.user.id })
  
  return {
    user: {
      id: dbRefreshToken.user.id,
      role: dbRefreshToken.user.role,
      fullName: dbRefreshToken.user.fullName,
      phone: dbRefreshToken.user.phone
    }
  }
})
