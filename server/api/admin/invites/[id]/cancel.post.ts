/**
 * POST /api/admin/invites/[id]/cancel
 * 
 * Cancel an active invite
 * 
 * Response:
 * {
 *   "ok": true,
 *   "canceledAt": string,
 *   "id": number
 * }
 * 
 * Security: Requires ADMIN role, includes CSRF protection
 */

import { prisma } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { createRequestLogger } from '../../../../utils/logger'
import { randomUUID } from 'crypto'
import { maskPhone } from '../../../../utils/rateLimiter'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Admin invite cancel started')
  
  // Check authentication and admin role
  const user = await requireAuth(event)
  requireRole(user, 'ADMIN')
  
  const inviteId = parseInt(getRouterParam(event, 'id') || '0')
  
  if (!inviteId || inviteId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid invite ID'
    })
  }
  
  try {
    // Cancel invite in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find the invite
      const invite = await tx.invite.findUnique({
        where: { id: inviteId },
        include: { createdByUser: true }
      })
      
      if (!invite) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          message: 'دعوت یافت نشد'
        })
      }
      
      // Check if already canceled or used
      if (invite.canceledAt) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Conflict',
          message: 'این دعوت قبلاً لغو شده است'
        })
      }
      
      if (invite.usedAt) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Conflict',
          message: 'این دعوت قبلاً استفاده شده است'
        })
      }
      
      // Cancel the invite
      const canceledAt = new Date()
      const updatedInvite = await tx.invite.update({
        where: { id: inviteId },
        data: {
          canceledAt,
          expiresAt: canceledAt // Set expiresAt to now to make it immediately expired
        }
      })
      
      return { invite: updatedInvite, canceledAt }
    })
    
    logger.info('Invite canceled successfully', {
      requestId,
      inviteId,
      phone: maskPhone(result.invite.phone),
      role: result.invite.role,
      canceledAt: result.canceledAt
    })
    
    return {
      ok: true,
      canceledAt: result.canceledAt.toISOString(),
      id: result.invite.id
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error('Invite cancel failed', {
      requestId,
      inviteId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to cancel invite'
    })
  }
})