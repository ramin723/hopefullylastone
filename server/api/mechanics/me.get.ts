// server/api/mechanics/me.get.ts
import { defineEventHandler, createError, getQuery } from 'h3'
import { prisma } from '~/server/utils/db'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // احراز هویت و بررسی نقش
    const auth = await requireAuth(event, ['MECHANIC', 'ADMIN'])

    // اگر ADMIN است و userId در query نیست، خطا بده
    if (auth.role === 'ADMIN') {
      const q = getQuery(event)
      if (!q.userId || typeof q.userId !== 'string') {
        throw createError({ 
          statusCode: 400, 
          statusMessage: 'Admin must provide userId query parameter' 
        })
      }
      
      // برای ADMIN، اطلاعات مکانیک مشخص شده را برگردان
      const mechanic = await prisma.mechanic.findUnique({
        where: { id: Number(q.userId) },
        include: { user: { select: { fullName: true } } }
      })
      
      if (!mechanic) {
        throw createError({ statusCode: 404, statusMessage: 'Mechanic not found' })
      }
      
      console.log(`[MECHANIC ME API] Admin ${auth.id} retrieved mechanic ${mechanic.id}`)
      
      return {
        id: mechanic.id,
        code: mechanic.code,
        name: mechanic.user.fullName,
        tier: mechanic.tier,
        qrActive: mechanic.qrActive,
        createdAt: mechanic.createdAt
      }
    }

    // برای MECHANIC، اطلاعات خودش را برگردان
    const mechanic = await prisma.mechanic.findUnique({
      where: { userId: auth.id },
      include: { user: { select: { fullName: true } } }
    })
    
    if (!mechanic) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Mechanic profile not found' 
      })
    }
    
    console.log(`[MECHANIC ME API] Mechanic ${mechanic.id} retrieved own profile`)
    
    return {
      id: mechanic.id,
      code: mechanic.code,
      name: mechanic.user.fullName,
      tier: mechanic.tier,
      qrActive: mechanic.qrActive,
      createdAt: mechanic.createdAt
    }

  } catch (error: any) {
    console.error('[MECHANIC ME API] Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error while retrieving mechanic profile' 
    })
  }
})
