// server/api/auth/logout.post.ts
import { prisma } from '../../utils/db'
import { hashRefreshToken } from '../../utils/tokens'
import { createRequestLogger } from '../../utils/logger'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Logout attempt started')
  
  // Get refresh token from cookie
  const refreshToken = getCookie(event, 'rt')
  if (refreshToken) {
    try {
      // Hash the refresh token and revoke it
      const refreshTokenHash = hashRefreshToken(refreshToken)
      
      await prisma.refreshToken.updateMany({
        where: { 
          tokenHash: refreshTokenHash,
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      })
      
      logger.info('Refresh token revoked successfully')
    } catch (error: any) {
      logger.error('Error revoking refresh token', { error: error?.message || 'Unknown error' })
    }
  }
  
  // Clear cookies
  deleteCookie(event, 'at', { path: '/' })
  deleteCookie(event, 'rt', { path: '/' })
  
  logger.info('Logout successful')
  
  return { success: true }
})
