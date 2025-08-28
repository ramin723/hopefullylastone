// server/utils/rateLimiter.ts
import type { H3Event } from 'h3'
import crypto from 'node:crypto'

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function rateLimitComposite({
  key,
  windowMs = 5 * 60 * 1000,
  max = 5,
}: {
  key: string
  windowMs?: number
  max?: number
}): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const b = buckets.get(key)

  if (!b || now > b.resetAt) {
    const bucket: Bucket = { count: 1, resetAt: now + windowMs }
    buckets.set(key, bucket)
    return { allowed: true, remaining: max - 1, resetAt: bucket.resetAt }
  }

  if (b.count >= max) {
    return { allowed: false, remaining: 0, resetAt: b.resetAt }
  }

  b.count += 1
  return { allowed: true, remaining: max - b.count, resetAt: b.resetAt }
}

/** Best-effort client IP extraction (handles proxies) */
export function getClientIP(event: H3Event): string {
  const xf = event.node.req.headers['x-forwarded-for']
  if (typeof xf === 'string' && xf.length > 0) {
    // x-forwarded-for: "client, proxy1, proxy2"
    const first = xf.split(',')[0]?.trim()
    if (first) return first
  }
  return event.node.req.socket.remoteAddress || '0.0.0.0'
}

export function hashPhone(phone: string): string {
  return crypto.createHash('sha256').update((phone || '').trim()).digest('hex')
}

export function maskPhone(phone: string): string {
  const p = (phone || '').trim()
  if (p.length <= 5) return '***'
  return `${p.slice(0, 3)}***${p.slice(-2)}`
}

/** Build composite key for login attempts (IP + phoneHash) */
export function buildLoginKey(event: H3Event, phone: string): string {
  const ip = getClientIP(event)
  const ph = hashPhone(phone || '')
  return `${ip}:${ph}`
}
