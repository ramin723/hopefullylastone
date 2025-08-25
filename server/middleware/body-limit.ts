import { defineEventHandler, getRequestHeader, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // فقط روی POST/PUT/PATCH/DELETE
  const method = event.method || ''
  if (!/^(POST|PUT|PATCH|DELETE)$/i.test(method)) return

  const len = Number(getRequestHeader(event, 'content-length') || '0')
  const MAX = 1_000_000 // ~1MB
  
  if (len && len > MAX) {
    throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
  }

  // اگر content-length ارسال نشده، اجازه می‌دهیم ادامه دهد
  // نیترو خودش body-parsing می‌کند و محدودیت‌های خودش را اعمال می‌کند
})
