// server/api/admin/mechanics/index.post.ts
import { prisma } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { rateLimitComposite, getClientIP, maskPhone } from '../../../utils/rateLimiter'
import { generateMechanicCode } from '../../../utils/ids'
import logger from '../../../utils/logger'
import { z } from 'zod'

// Request validation schema
const CreateMechanicSchema = z.object({
  fullName: z.string().min(3, 'نام باید حداقل 3 کاراکتر باشد'),
  phone: z.string().min(10, 'شماره تلفن باید حداقل 10 رقم باشد').max(15, 'شماره تلفن نباید بیش از 15 رقم باشد'),
  note: z.string().optional(),
  assignQrNow: z.boolean().default(false)
})

export default defineEventHandler(async (event: any) => {
  try {
    // 1. Authentication - only ADMIN can create mechanics
    const auth = await requireAuth(event, ['ADMIN'])
    
    // 2. Rate limiting - 20 requests per 5 minutes per IP+User
    const ip = getClientIP(event)
    const rateKey = `admin.mechanics.create:${ip}:${auth.id}`
    const rateLimit = rateLimitComposite({
      key: rateKey,
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 20
    })
    
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests'
      })
    }
    
    // 3. Parse and validate request body
    const body = await readBody(event)
    const validation = CreateMechanicSchema.safeParse(body)
    
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data: ' + validation.error.issues.map(i => i.message).join(', ')
      })
    }
    
    const { fullName, phone, note, assignQrNow } = validation.data
    
    // 4. Check if user with this phone already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, role: true, fullName: true }
    })
    
    let userCreated = false
    let userId: number
    
    if (existingUser) {
      // User exists - check role compatibility
      if (existingUser.role === 'VENDOR') {
        throw createError({
          statusCode: 409,
          statusMessage: 'کاربر با این شماره تلفن قبلاً به عنوان فروشگاه ثبت شده است'
        })
      }
      
      if (existingUser.role === 'ADMIN') {
        throw createError({
          statusCode: 409,
          statusMessage: 'کاربر با این شماره تلفن قبلاً به عنوان ادمین ثبت شده است'
        })
      }
      
      // User is MECHANIC or can be converted to MECHANIC
      userId = existingUser.id
      
      // Update user role if needed
      if (existingUser.role !== 'MECHANIC') {
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'MECHANIC' }
        })
      }
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          fullName,
          phone,
          passwordHash: '', // No password set initially
          mustChangePassword: true, // User must set password on first login
          role: 'MECHANIC'
        } as any,
        select: { id: true }
      })
      
      userId = newUser.id
      userCreated = true
    }
    
    // 5. Check if mechanic record already exists
    const existingMechanic = await prisma.mechanic.findUnique({
      where: { userId },
      select: { id: true, code: true }
    })
    
    let mechanic: any
    let qrAssigned = false
    
    if (existingMechanic) {
      // Mechanic record exists
      if (assignQrNow && existingMechanic.code) {
        throw createError({
          statusCode: 409,
          statusMessage: 'این مکانیک قبلاً کد QR دارد'
        })
      }
      
      if (assignQrNow && !existingMechanic.code) {
        // Generate and assign QR code
        let attempts = 0
        const maxAttempts = 10
        let newCode: string
        
        do {
          newCode = generateMechanicCode()
          attempts++
          
          // Check if code already exists
          const codeExists = await prisma.mechanic.findFirst({
            where: { code: newCode },
            select: { id: true }
          })
          
          if (!codeExists) break
          
          if (attempts >= maxAttempts) {
            throw createError({
              statusCode: 500,
              statusMessage: 'نمی‌توان کد یکتا تولید کرد'
            })
          }
        } while (true)
        
        // Update mechanic with new code
        mechanic = await prisma.mechanic.update({
          where: { id: existingMechanic.id },
          data: { 
            code: newCode,
            qrActive: true
          },
          select: {
            id: true,
            code: true,
            qrActive: true,
            createdAt: true,
            user: {
              select: {
                fullName: true,
                phone: true
              }
            }
          }
        })
        
        qrAssigned = true
      } else {
        // Just return existing mechanic
        mechanic = await prisma.mechanic.findUnique({
          where: { id: existingMechanic.id },
          select: {
            id: true,
            code: true,
            qrActive: true,
            createdAt: true,
            user: {
              select: {
                fullName: true,
                phone: true
              }
            }
          }
        })
      }
    } else {
      // Create new mechanic record
      let code: string = ''
      
      if (assignQrNow) {
        // Generate unique code
        let attempts = 0
        const maxAttempts = 10
        
        do {
          code = generateMechanicCode()
          attempts++
          
          // Check if code already exists
          const codeExists = await prisma.mechanic.findFirst({
            where: { code },
            select: { id: true }
          })
          
          if (!codeExists) break
          
          if (attempts >= maxAttempts) {
            throw createError({
              statusCode: 500,
              statusMessage: 'نمی‌توان کد یکتا تولید کرد'
            })
          }
        } while (true)
        
        qrAssigned = true
      } else {
        // Generate a temporary code that will be updated later
        code = `TEMP_${userId}_${Date.now()}`
      }
      
      mechanic = await prisma.mechanic.create({
        data: {
          userId,
          code,
          qrActive: assignQrNow
        },
        select: {
          id: true,
          code: true,
          qrActive: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              phone: true
            }
          }
        }
      })
    }
    
    // 6. Log the action (without PII)
    logger.info({
      adminId: auth.id,
      mechanicId: mechanic.id,
      userCreated,
      qrAssigned,
      phone: maskPhone(phone),
      action: 'CREATE_MECHANIC'
    }, '[ADMIN CREATE MECHANIC API] Mechanic created successfully')
    
    // 7. Return response
    return {
      ok: true,
      mechanic: {
        id: mechanic.id,
        fullName: mechanic.user.fullName,
        phone: mechanic.user.phone,
        code: mechanic.code,
        qrActive: mechanic.qrActive,
        createdAt: mechanic.createdAt
      },
      userCreated,
      qrAssigned
    }
    
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data'
      })
    }
    
    logger.error({ err: error }, '[ADMIN CREATE MECHANIC API] Error creating mechanic')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while creating mechanic'
    })
  }
})
