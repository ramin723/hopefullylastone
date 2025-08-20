// server/api/auth/login.post.ts
import { prisma } from '../../utils/db'
import bcrypt from 'bcryptjs'
import { sign } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string; password?: string }>(event)
  
  console.log('Login attempt for phone:', body?.phone)
  
  if (!body?.phone || !body?.password) {
    console.log('Login failed: missing phone or password')
    throw createError({ statusCode: 400, statusMessage: 'phone & password required' })
  }

  const user = await prisma.user.findUnique({ where: { phone: body.phone } })
  if (!user) {
    console.log('Login failed: user not found for phone:', body.phone)
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(body.password, user.passwordHash)
  if (!ok) {
    console.log('Login failed: wrong password for phone:', body.phone)
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const token = sign({ userId: user.id, role: user.role })
  
  console.log('Login successful for user:', user.fullName, 'role:', user.role)
  
  return {
    token,
    user: { id: user.id, role: user.role, fullName: user.fullName, phone: user.phone }
  }
})
