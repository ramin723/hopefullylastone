// server/api/admin/invites/[id]/cancel.post.ts
import { prisma } from '../../../../utils/db'
import { createRequestLogger } from '../../../../utils/logger'
import { randomUUID } from 'crypto'
import { maskPhone } from '../../../../utils/rateLimiter'
import { requireAuth, requireRole } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const requestId = randomUUID()
  const logger = createRequestLogger(requestId)
  
  logger.info('Admin invite cancellation started')
  
  // Check authentication and admin role
  const user = await requireAuth(event)
  requireRole(user, 'ADMIN')
  
  const inviteId = getRouterParam(event, 'id')
  
  if (!inviteId || isNaN(Number(inviteId))) {
    logger.error('Invalid invite ID', { requestId, inviteId })
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid invite ID'
    })
  }
  
  try {
    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { id: Number(inviteId) },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })
    
    if (!invite) {
      logger.warn('Invite not found', { requestId, inviteId })
      throw createError({
        statusCode: 404,
        statusMessage: 'Invite not found'
      })
    }
    
    // Check if invite is already used or expired
    if (invite.usedAt) {
      logger.warn('Cannot cancel used invite', { 
        requestId, 
        inviteId,
        usedAt: invite.usedAt
      })
      throw createError({
        statusCode: 409,
        statusMessage: 'Cannot cancel used invite',
        message: 'این دعوت قبلاً استفاده شده است'
      })
    }
    
    if (new Date() > invite.expiresAt) {
      logger.warn('Cannot cancel expired invite', { 
        requestId, 
        inviteId,
        expiresAt: invite.expiresAt
      })
      throw createError({
        statusCode: 409,
        statusMessage: 'Cannot cancel expired invite',
        message: 'این دعوت منقضی شده است'
      })
    }
    
    // Cancel the invite by setting meta.cancelled = true
    const currentMeta = invite.meta as any || {}
    await prisma.invite.update({
      where: { id: Number(inviteId) },
      data: { 
        meta: {
          ...currentMeta,
          cancelled: true,
          cancelledAt: new Date().toISOString(),
          cancelledBy: user.id
        }
      }
    })
    
    logger.info('Invite cancelled successfully', {
      requestId,
      inviteId,
      phone: maskPhone(invite.phone),
      role: invite.role
    })
    
    return {
      ok: true,
      message: 'دعوت با موفقیت لغو شد'
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    logger.error('Invite cancellation failed', {
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