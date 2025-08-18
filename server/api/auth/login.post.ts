// server/api/auth/login.post.ts
import { prisma } from '../../utils/db'
import bcrypt from 'bcryptjs'
import { sign } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string; password?: string }>(event)
  if (!body?.phone || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'phone & password required' })
  }

  const user = await prisma.user.findUnique({ where: { phone: body.phone } })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })

  const ok = await bcrypt.compare(body.password, user.passwordHash)
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })

  const token = sign({ userId: user.id, role: user.role })
  return {
    token,
    user: { id: user.id, role: user.role, fullName: user.fullName, phone: user.phone }
  }
})
