// server/api/settlements/index.post.ts
import { defineEventHandler, createError, readBody } from 'h3'
import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { CreateSettlementSchema } from '../../validators/settlements'
import { decimalToNumber } from '../../utils/decimal'
import logger from '../../utils/logger'
import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش ADMIN
    const auth = await requireAuth(event, ['ADMIN'])

    // اعتبارسنجی ورودی
    const body = await readBody(event)
    const parsed = CreateSettlementSchema.safeParse(body)
    if (!parsed.success) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: parsed.error.issues.map(i => i.message).join(', ') 
      })
    }
    
    const { vendorId, mechanicId, from, to } = parsed.data

    // بررسی وجود Vendor
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, storeName: true }
    })
    
    if (!vendor) {
      throw createError({ statusCode: 404, statusMessage: 'Vendor not found' })
    }

    const fromDate = new Date(from)
    const toDate = new Date(to)
    // نرمال‌سازی شروع/پایان روز در زمان محلی
    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999) // inclusive

    // تراکنش‌های قابل تسویه - فقط آنهایی که در Settlement دیگری نیستند
    const excludedIds = (
      await prisma.settlementItem.findMany({ select: { transactionId: true } })
    ).map(item => item.transactionId)

    const txs = await prisma.transaction.findMany({
      where: {
        vendorId,
        status: 'PENDING',
        createdAt: { gte: fromDate, lte: toDate },
        id: { notIn: excludedIds },
        ...(mechanicId ? { mechanicId } : {})
      },
      include: { commission: true }
    })

    if (!txs.length) {
      return { 
        created: false, 
        message: 'No pending transactions found in the specified date range', 
        count: 0,
        vendorName: vendor.storeName
      }
    }

    logger.debug({ rawFrom: from, rawTo: to, from: fromDate.toISOString(), to: toDate.toISOString(), vendorId, mechanicId }, '[SETTLEMENT CREATE] Input dates normalized')
    logger.info({ vendorId, mechanicId, count: txs.length }, '[SETTLEMENT CREATE] Found available transactions')

    // محاسبه مجموع‌ها
    const totalAmountEligible = txs.reduce<number>((sum, t) => {
      return sum + decimalToNumber(t.amountEligible)
    }, 0)
    const totalMechanicAmount = txs.reduce<number>((sum, t) => {
      return sum + decimalToNumber(t.commission?.mechanicAmount)
    }, 0)
    const totalPlatformAmount = txs.reduce<number>((sum, t) => {
      return sum + decimalToNumber(t.commission?.platformAmount)
    }, 0)

    // ایجاد Settlement و SettlementItem ها در یک تراکنش
    const result = await prisma.$transaction(async (tx) => {
      const settlement = await tx.settlement.create({
        data: {
          vendorId,
          periodFrom: fromDate,
          periodTo: toDate,
          totalAmountEligible,
          totalMechanicAmount,
          totalPlatformAmount,
          status: 'OPEN',
          items: {
            create: txs.map((t) => ({
              transactionId: t.id,
              mechanicAmount: t.commission?.mechanicAmount ?? new Prisma.Decimal(0),
              platformAmount: t.commission?.platformAmount ?? new Prisma.Decimal(0)
            }))
          }
        },
        include: {
          vendor: { select: { storeName: true } }
        }
      })

      // حذف تغییر وضعیت تراکنش‌ها - فقط در SettlementItem ثبت می‌شوند
      // وضعیت تراکنش‌ها هنگام mark-paid تغییر خواهد کرد

      return settlement
    })

    // لاگ موفقیت
    logger.info({ id: result.id, vendor: vendor.storeName, count: txs.length }, 'Settlement created successfully')

    return {
      created: true,
      settlementId: result.id,
      vendorId,
      vendorName: result.vendor.storeName,
      periodFrom: result.periodFrom,
      periodTo: result.periodTo,
      totals: {
        eligible: totalAmountEligible,
        mechanic: totalMechanicAmount,
        platform: totalPlatformAmount
      },
      items: txs.map(t => ({
        id: t.id,
        createdAt: t.createdAt,
        mechanicId: t.mechanicId,
        amountEligible: decimalToNumber(t.amountEligible),
        mechanicAmount: decimalToNumber(t.commission?.mechanicAmount),
        platformAmount: decimalToNumber(t.commission?.platformAmount)
      })),
      count: txs.length,
      message: `Settlement created successfully for ${vendor.storeName}`
    }

  } catch (error: any) {
    // لاگ خطا
    logger.error({ err: error }, 'Error creating settlement')
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while creating settlement' 
    })
  }
})
