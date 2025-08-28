// server/middleware/rate-limit-login.ts
import { defineEventHandler, getRequestHeader, getRequestURL, createError } from 'h3'

/**
 * Targeted rate limiting for login endpoint to prevent brute-force attacks
 * Keys: (IP + phone) → 5 attempts / 5 minutes, fallback IP → 20 attempts / 5 minutes
 */
type RateLimitEntry = { ts: number }
const LOGIN_BUCKET = new Map<string, RateLimitEntry[]>()

function getIp(event: any) {
  const xf = getRequestHeader(event, 'x-forwarded-for')
  if (xf) return xf.split(',')[0].trim()
  // @ts-ignore
  return event.node?.req?.socket?.remoteAddress || 'unknown'
}

async function extractPhoneFromBody(event: any): Promise<string | null> {
  try {
    const contentType = getRequestHeader(event, 'content-type')
    if (!contentType?.includes('application/json')) {
      return null
    }

    // Safely read and parse body
    const body = await readBody(event).catch(() => null)
    if (!body || typeof body !== 'object') {
      return null
    }

    const phone = (body as any).phone
    return typeof phone === 'string' ? phone : null
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  
  // Only apply to POST /api/auth/login
  if (url.pathname !== '/api/auth/login' || event.method !== 'POST') {
    return
  }

  const ip = getIp(event)
  const phone = await extractPhoneFromBody(event)
  
  const now = Date.now()
  const windowMs = 5 * 60 * 1000 // 5 minutes
  const limit = phone ? 5 : 20 // 5 for IP+phone, 20 for IP-only
  
  // Create composite key: IP + phone (if available)
  const key = phone ? `login:${ip}:${phone}` : `login:${ip}:unknown`
  
  const entries = LOGIN_BUCKET.get(key) || []
  
  // Clean old entries (sliding window)
  while (entries.length && (now - entries[0].ts) > windowMs) {
    entries.shift()
  }
  
  if (entries.length >= limit) {
    throw createError({ 
      statusCode: 429, 
      statusMessage: 'Too many login attempts. Please try again later.' 
    })
  }
  
  // Add current request
  entries.push({ ts: now })
  LOGIN_BUCKET.set(key, entries)
  
  // Cleanup old buckets periodically (simple cleanup)
  if (Math.random() < 0.01) { // 1% chance to cleanup
    for (const [bucketKey, bucketEntries] of LOGIN_BUCKET.entries()) {
      if (bucketEntries.length === 0 || (now - bucketEntries[bucketEntries.length - 1].ts) > windowMs * 2) {
        LOGIN_BUCKET.delete(bucketKey)
      }
    }
  }
})
