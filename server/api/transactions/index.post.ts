// server/api/transactions/index.post.ts
import { prisma } from '../../utils/db'
import { verify } from '../../utils/jwt'
import { CreateTxSchema } from '../../validators/transactions'
import { computeCommission } from '../../utils/commission'

export default defineEventHandler(async (event) => {
  // 1) Auth: require vendor
  const auth = getHeader(event, 'authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Missing token' })

  const payload = verify<{ userId: number; role: string }>(token)
  if (payload.role !== 'VENDOR') {
    throw createError({ statusCode: 403, statusMessage: 'Only VENDOR can create transactions' })
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: payload.userId } })
  if (!vendor || vendor.status !== 'ACTIVE') {
    throw createError({ statusCode: 403, statusMessage: 'Vendor not active' })
  }

  // 2) Validate body
  const body = await readBody(event)
  const parsed = CreateTxSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues.map(i => i.message).join(', ') })
  }
  const { mechanicCode, customerPhone, amountTotal, amountEligible, note } = parsed.data

  // 3) Resolve mechanic
  const mechanic = await prisma.mechanic.findUnique({
    where: { code: mechanicCode },
    include: { user: true },
  })
  if (!mechanic || !mechanic.qrActive) {
    throw createError({ statusCode: 404, statusMessage: 'mechanic not found or inactive' })
  }

  // 4) Compute commissions (use vendor.percentDefault if needed later; for MVP fixed 3%/2%)
  const { mechanicAmount, platformAmount } = computeCommission(amountEligible, 0.03, 0.02)

  // 5) Create transaction + commission
  const tx = await prisma.transaction.create({
    data: {
      mechanicId: mechanic.id,
      vendorId: vendor.id,
      customerPhone,
      amountTotal,
      amountEligible,
      note,
      status: 'PENDING',
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
})
