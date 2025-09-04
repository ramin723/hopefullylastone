// server/api/admin/mechanics/[id]/code.post.ts
import { prisma } from '../../../../utils/db'
import { requireAuth } from '../../../../utils/auth'
import { rateLimitComposite, getClientIP } from '../../../../utils/rateLimiter'
import logger from '../../../../utils/logger'
import { generateMechanicCode } from '../../../../utils/ids'
import { z } from 'zod'

// Request body validation
const BodySchema = z.object({
  action: z.enum(['assign', 'rotate', 'activate', 'deactivate']),
  confirmRotate: z.boolean().optional()
})

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can manage mechanic codes
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 30 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.mechanic.code:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 30
    })
    
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests'
      })
    }
    
    // 3. Get mechanic ID from URL
    const mechanicId = parseInt(event.context.params.id)
    if (!mechanicId || isNaN(mechanicId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid mechanic ID'
      })
    }
    
    // 4. Parse and validate request body
    const body = await readBody(event)
    const validatedBody = BodySchema.parse(body)
    const { action, confirmRotate } = validatedBody
    
    // 5. Get current mechanic state
    const currentMechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
      select: { 
        id: true, 
        code: true, 
        qrActive: true,
        user: {
          select: { fullName: true }
        }
      }
    })
    
    if (!currentMechanic) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Mechanic not found'
      })
    }
    
    // 6. Execute action in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let newCode: string | null = null
      let qrActive = currentMechanic.qrActive
      let rotated = false
      
      // Helper function to generate unique code
      const generateUniqueCode = async (): Promise<string> => {
        let attempts = 0
        const maxAttempts = 5
        
        do {
          const code = generateMechanicCode()
          attempts++
          
          const existing = await tx.mechanic.findFirst({
            where: { code },
            select: { id: true }
          })
          
          if (!existing) return code
          
          if (attempts >= maxAttempts) {
            throw createError({
              statusCode: 500,
              statusMessage: 'Unable to generate unique code after multiple attempts'
            })
          }
        } while (true)
      }
      
      switch (action) {
        case 'assign':
          if (currentMechanic.code) {
            throw createError({
              statusCode: 409,
              statusMessage: 'این مکانیک قبلاً کد دارد'
            })
          }
          
          newCode = await generateUniqueCode()
          qrActive = true
          break
          
        case 'rotate':
          if (!currentMechanic.code) {
            throw createError({
              statusCode: 400,
              statusMessage: 'کدی برای چرخش وجود ندارد'
            })
          }
          
          if (confirmRotate !== true) {
            throw createError({
              statusCode: 400,
              statusMessage: 'برای چرخش کد، تأیید الزامی است'
            })
          }
          
          newCode = await generateUniqueCode()
          qrActive = true
          rotated = true
          break
          
        case 'activate':
          if (!currentMechanic.code) {
            throw createError({
              statusCode: 400,
              statusMessage: 'ابتدا کد تخصیص دهید'
            })
          }
          qrActive = true
          break
          
        case 'deactivate':
          if (!currentMechanic.code) {
            throw createError({
              statusCode: 400,
              statusMessage: 'ابتدا کد تخصیص دهید'
            })
          }
          qrActive = false
          break
      }
      
      // Update mechanic
      const updatedMechanic = await tx.mechanic.update({
        where: { id: mechanicId },
        data: {
          ...(newCode && { code: newCode }),
          qrActive
        },
        select: { id: true, code: true, qrActive: true }
      })
      
      return {
        mechanic: updatedMechanic,
        rotated,
        newCode
      }
    })
    
    // 7. Log the action
    const logLevel = action === 'rotate' ? 'warn' : 'info'
    const logData = {
      adminId: auth.id,
      mechanicId: currentMechanic.id,
      mechanicName: currentMechanic.user.fullName,
      action,
      previousCode: currentMechanic.code,
      newCode: result.newCode,
      previousQrActive: currentMechanic.qrActive,
      newQrActive: result.mechanic.qrActive,
      ip,
      userAgent: event.headers.get('user-agent') || 'unknown'
    }
    
    if (logLevel === 'warn') {
      logger.warn(logData, '[ADMIN MECHANIC CODE API] QR code rotated - SECURITY EVENT')
    } else {
      logger.info(logData, '[ADMIN MECHANIC CODE API] QR code action executed')
    }
    
    // 8. Return response
    const response: any = {
      ok: true,
      mechanicId: result.mechanic.id,
      codePresent: !!result.mechanic.code,
      qrActive: result.mechanic.qrActive,
      code: result.mechanic.code
    }
    
    if (result.rotated) {
      response.rotated = true
    }
    
    return response
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body'
      })
    }
    
    logger.error({ err: error }, '[ADMIN MECHANIC CODE API] Error executing code action')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while executing code action'
    })
  }
})
