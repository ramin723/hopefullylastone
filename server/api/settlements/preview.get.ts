import { defineEventHandler, createError, getQuery } from 'h3'
import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { decimalToNumber } from '../../utils/decimal'

export default defineEventHandler(async (event) => {
  // فقط ADMIN دسترسی دارد
  await requireAuth(event, ['ADMIN'])

  const q = getQuery(event)

  const vendorId = Number(q.vendorId)
  if (!vendorId || isNaN(vendorId)) {
    throw createError({ statusCode: 400, statusMessage: 'vendorId الزامی و باید عددی باشد' })
  }

  const mechanicId = q.mechanicId ? Number(q.mechanicId) : undefined
  if (q.mechanicId && (isNaN(Number(q.mechanicId)) || Number(q.mechanicId) <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'mechanicId نامعتبر است' })
  }

  const from = typeof q.from === 'string' ? q.from : ''
  const to = typeof q.to === 'string' ? q.to : ''
  if (!from || !to) {
    throw createError({ statusCode: 400, statusMessage: 'from و to الزامی هستند' })
  }

  const page = q.page ? Math.max(1, Number(q.page)) : 1
  const pageSize = q.pageSize ? Math.min(100, Math.max(1, Number(q.pageSize))) : 20
  if (isNaN(page) || isNaN(pageSize)) {
    throw createError({ statusCode: 400, statusMessage: 'page یا pageSize نامعتبر است' })
  }

  // نرمال‌سازی شروع/پایان روز در زمان محلی
  const fromDate = new Date(from)
  const toDate = new Date(to)
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'فرمت تاریخ نامعتبر است' })
  }
  fromDate.setHours(0, 0, 0, 0)
  toDate.setHours(23, 59, 59, 999)

  // تراکنش‌هایی که قبلاً در Settlement ثبت شده‌اند را حذف کن
  const excludedIds = (
    await prisma.settlementItem.findMany({ select: { transactionId: true } })
  ).map((i) => i.transactionId)

  const where = {
    vendorId,
    status: 'PENDING' as const,
    createdAt: { gte: fromDate, lte: toDate },
    id: { notIn: excludedIds },
    ...(mechanicId ? { mechanicId } : {})
  }

  // جمع کل برای همه رکوردهای مطابق (نه فقط صفحه جاری)
  const allForTotals = await prisma.transaction.findMany({
    where,
    select: {
      amountEligible: true,
      commission: { select: { mechanicAmount: true, platformAmount: true } }
    }
  })

  const totalsEligible = allForTotals.reduce((sum, t) => sum + decimalToNumber(t.amountEligible), 0)
  const totalsMechanic = allForTotals.reduce((sum, t) => sum + decimalToNumber(t.commission?.mechanicAmount), 0)
  const totalsPlatform = allForTotals.reduce((sum, t) => sum + decimalToNumber(t.commission?.platformAmount), 0)

  const count = allForTotals.length

  // دریافت آیتم‌های صفحه جاری
  const itemsPage = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { commission: true, mechanic: { include: { user: true } } },
    skip: (page - 1) * pageSize,
    take: pageSize
  })

  const items = itemsPage.map((t) => ({
    id: t.id,
    createdAt: t.createdAt,
    customerPhone: t.customerPhone,
    mechanic: { id: t.mechanicId, name: t.mechanic.user.fullName, code: t.mechanic.code },
    amounts: {
      total: Number(t.amountTotal),
      eligible: Number(t.amountEligible),
      mechanic: decimalToNumber(t.commission?.mechanicAmount),
      platform: decimalToNumber(t.commission?.platformAmount)
    },
    note: t.note ?? null
  }))

  return {
    items,
    totals: {
      eligible: totalsEligible,
      mechanic: totalsMechanic,
      platform: totalsPlatform
    },
    count
  }
})


