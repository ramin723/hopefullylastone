// server/api/auth/me.get.ts
import { prisma } from '../../utils/db'
import { verify } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const auth = getHeader(event, 'authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Missing token' })

  const payload = verify<{ userId: number; role: string }>(token)
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid token' })

  return { user: { id: user.id, role: user.role, fullName: user.fullName, phone: user.phone } }
})
