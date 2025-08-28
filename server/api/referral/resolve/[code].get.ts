// server/api/referral/resolve/[code].get.ts
import { prisma } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { getRequestIP } from 'h3'

// Local rate limit bucket for this endpoint
type RateLimitEntry = { ts: number }
const LOCAL_BUCKET = new Map<string, RateLimitEntry[]>()

export default defineEventHandler(async (event) => {
  // 1. Require authentication
  const auth = await requireAuth(event, ['VENDOR', 'ADMIN'])
  
  // 2. Local rate limiting
  const ip = getRequestIP(event) || 'unknown'
  const rateKey = `${auth.id}|${ip}|referral.resolve`
  const now = Date.now()
  const windowMs = 60_000 // 1 minute
  const limit = 10 // 10 requests per minute
  
  const entries = LOCAL_BUCKET.get(rateKey) || []
  // Clean old entries
  while (entries.length && (now - entries[0].ts) > windowMs) entries.shift()
  
  if (entries.length >= limit) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
  
  entries.push({ ts: now })
  LOCAL_BUCKET.set(rateKey, entries)
  
  const code = getRouterParam(event, 'code')
  if (!code) throw createError({ statusCode: 400, statusMessage: 'mechanic code is required' })

  // 3. Query with minimal data
  const mech = await prisma.mechanic.findUnique({
    where: { code },
    select: { id: true, code: true, qrActive: true }
  })
  
  const ok = !!(mech && mech.qrActive)
  const codePrefix = code.substring(0, 2)
  
  // 4. Structured logging
  console.log(`[QR RESOLVE] requestId:${event.context.requestId || 'unknown'} userId:${auth.id} ok:${ok} codePrefix:${codePrefix} message:"QR resolve attempt"`)
  
  // 5. Return minimal data with consistent shape
  if (ok) {
    return {
      ok: true,
      mechanicId: mech!.id,
      mechanicCode: mech!.code
    }
  } else {
    return {
      ok: false,
      mechanicId: null,
      mechanicCode: null
    }
  }
})
