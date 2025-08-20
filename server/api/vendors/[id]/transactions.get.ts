// server/api/vendors/[id]/transactions.get.ts
import { prisma } from '../../../utils/db'
import { verify } from '../../../utils/jwt'

export default defineEventHandler(async (event) => {
  const auth = getHeader(event, 'authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Missing token' })
  const payload = verify<{ userId: number; role: string }>(token)

  const vendorIdParam = Number(getRouterParam(event, 'id'))
  if (!vendorIdParam) throw createError({ statusCode: 400, statusMessage: 'invalid vendor id' })

  const vendor = await prisma.vendor.findUnique({ where: { userId: payload.userId } })

  if (payload.role === 'VENDOR') {
    if (!vendor || vendor.id !== vendorIdParam) {
      throw createError({ statusCode: 403, statusMessage: 'forbidden' })
    }
  }

  const q = getQuery(event)
  const where: any = { vendorId: vendorIdParam }
  if (q.status && typeof q.status === 'string') where.status = q.status
  if (q.from || q.to) {
    where.createdAt = {}
    if (q.from && typeof q.from === 'string') where.createdAt.gte = new Date(q.from as string)
    if (q.to && typeof q.to === 'string') where.createdAt.lte = new Date(q.to as string)
  }

  const rows = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { commission: true, mechanic: { include: { user: true } } }
  }) as Array<{
    id: number
    createdAt: Date
    status: string
    mechanicId: number
    mechanic: { user: { fullName: string }, code: string }
    commission: { mechanicAmount: number; platformAmount: number } | null
    amountTotal: number
  }>

  return rows.map((tx) => ({
    id: tx.id,
    createdAt: tx.createdAt,
    status: tx.status,
    mechanic: { id: tx.mechanicId, name: tx.mechanic.user.fullName, code: tx.mechanic.code },
    amounts: {
      total: tx.amountTotal,
      eligible: tx.amountTotal,
      commission: {
        mechanic: tx.commission?.mechanicAmount ?? 0,
        platform: tx.commission?.platformAmount ?? 0
      }
    }
  }))
})
