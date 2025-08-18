// server/api/referral/resolve/[code].get.ts
import { prisma } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  if (!code) throw createError({ statusCode: 400, statusMessage: 'mechanic code is required' })

  const mech = await prisma.mechanic.findUnique({
    where: { code },
    include: { user: true },
  })
  if (!mech || !mech.qrActive) {
    throw createError({ statusCode: 404, statusMessage: 'mechanic not found or inactive' })
  }

  return {
    mechanicId: mech.id,
    mechanicCode: mech.code,
    mechanicName: mech.user.fullName,
  }
})
