import { defineEventHandler, setCookie } from 'h3'
import crypto from 'node:crypto'

const isProd = process.env.NODE_ENV === 'production'

export default defineEventHandler((event) => {
  const token = crypto.randomBytes(24).toString('hex')
  setCookie(event, 'csrf', token, {
    httpOnly: false,    // باید قابل خواندن توسط JS باشد
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return { csrf: token }
})
