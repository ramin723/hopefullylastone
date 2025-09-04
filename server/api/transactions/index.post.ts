// server/api/transactions/index.post.ts
import { defineEventHandler, getRequestHeader, createError, readBody } from 'h3'
import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { CreateTxSchema } from '../../validators/transactions'
import { computeCommission } from '../../utils/commission'
import logger from '../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    // فقط فروشنده اجازه دارد
    const auth = await requireAuth(event, ['VENDOR'])

  // از userId → vendor پیدا کن
  const vendor = await prisma.vendor.findUnique({ where: { userId: auth.id } })
  if (!vendor || vendor.status !== 'ACTIVE') {
    throw createError({ statusCode: 403, statusMessage: 'Vendor not active' })
  }

  // آیدم‌پوتنسی: کلید از هدر
  const idem = getRequestHeader(event, 'x-idempotency-key')?.trim()
  if (idem) {
    const exists = await prisma.transaction.findFirst({
      where: { idempotencyKey: idem, vendorId: vendor.id }
    })
    if (exists) {
      // می‌تونی 200 با همان رکورد بدهی یا 409 برگردانی. ترجیح من برگرداندن رکورد است:
      return { id: exists.id, idempotent: true }
    }
  }

  // 2) Validate body
  const body = await readBody(event)
  const parsed = CreateTxSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues.map(i => i.message).join(', ') })
  }
  const { mechanicCode, customerPhone, amountTotal, amountEligible, note, orderCode } = parsed.data

  // 3) Resolve mechanic
  const mechanic = await prisma.mechanic.findUnique({
    where: { code: mechanicCode },
    include: { user: true },
  })
  if (!mechanic || !mechanic.qrActive) {
    throw createError({ statusCode: 404, statusMessage: 'mechanic not found or inactive' })
  }

  // 3.5) If orderCode provided, validate and consume order
  let order = null
  if (orderCode) {
    order = await prisma.order.findUnique({
      where: { code: orderCode },
      select: { id: true, status: true, mechanicId: true }
    })
    
    if (!order) {
      throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    }
    
    if (order.status !== 'PENDING') {
      throw createError({ statusCode: 409, statusMessage: 'Order already consumed or invalid' })
    }
    
    if (order.mechanicId !== mechanic.id) {
      throw createError({ statusCode: 400, statusMessage: 'Order does not belong to this mechanic' })
    }
  }

  // 4) Compute commissions (use vendor.percentDefault if needed later; for MVP fixed 3%/2%)
  const { mechanicAmount, platformAmount } = computeCommission(amountEligible, 0.03, 0.02)

  // 5) Create transaction + commission + consume order if provided
  const tx = await prisma.$transaction(async (prismaTx) => {
    // Create transaction
    const transaction = await prismaTx.transaction.create({
      data: {
        mechanicId: mechanic.id,
        vendorId: vendor.id,
        customerPhone,
        amountTotal,
        amountEligible,
        note,
        status: 'PENDING',
        idempotencyKey: idem || null,
        commission: {
          create: {
            rateMechanic: 0.03,
            ratePlatform: 0.02,
            mechanicAmount,
            platformAmount
          }
        }
      },
      include: { commission: true }
    })
    
    // Consume order if provided
    if (order) {
      await prismaTx.order.update({
        where: { id: order.id },
        data: {
          status: 'CONSUMED',
          consumedAt: new Date(),
          consumedByVendorId: vendor.id
        }
      })
      
      logger.info({
        orderId: order.id,
        orderCode,
        transactionId: transaction.id,
        vendorId: vendor.id
      }, '[TRANSACTIONS API] Order consumed during transaction creation')
    }
    
    return transaction
  })

  return {
    id: tx.id,
    status: tx.status,
    mechanic: { id: mechanic.id, name: mechanic.user.fullName, code: mechanic.code },
    vendor: { id: vendor.id, name: vendor.storeName },
    amounts: {
      total: tx.amountTotal,
      eligible: tx.amountTotal,
      commission: {
        mechanic: tx.commission?.mechanicAmount ?? mechanicAmount,
        platform: tx.commission?.platformAmount ?? platformAmount
      }
    },
    createdAt: tx.createdAt
  }

  } catch (error: any) {
    console.error('[TRANSACTIONS API] Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while creating transaction' 
    })
  }
})
