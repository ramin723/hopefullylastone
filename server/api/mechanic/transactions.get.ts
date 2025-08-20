// server/api/mechanic/transactions.get.ts
import { prisma } from '~/server/utils/db'
import { verify } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const auth = getHeader(event, 'authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Missing token' })

  const payload = verify<{ userId: number; role: string }>(token)
  if (payload.role !== 'MECHANIC') {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }

  const mechanic = await prisma.mechanic.findUnique({ where: { userId: payload.userId } })
  if (!mechanic) throw createError({ statusCode: 404, statusMessage: 'mechanic not found' })

  const q = getQuery(event)
  const where: any = { mechanicId: mechanic.id }
  if (q.status && typeof q.status === 'string') where.status = q.status
  if (q.from || q.to) {
    where.createdAt = {}
    if (q.from && typeof q.from === 'string') where.createdAt.gte = new Date(q.from as string)
    if (q.to && typeof q.to === 'string') where.createdAt.lte = new Date(q.to as string)
  }

  const rows = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { commission: true, vendor: true }
  }) as Array<{
    id: number
    createdAt: Date
    vendor: { storeName: string } | null
    status: string
    amountTotal: number
    amountEligible: number
    commission: { mechanicAmount: number } | null
  }>

  const totalMechanic = rows.reduce<number>((sum, row) => sum + (row.commission?.mechanicAmount ?? 0), 0)

  return {
    totalMechanic,
    count: rows.length,
    items: rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      vendor: row.vendor?.storeName ?? '',
      status: row.status,
      amountTotal: row.amountTotal,
      amountEligible: row.amountEligible,
      mechanicAmount: row.commission?.mechanicAmount ?? 0
    }))
  }
})
