// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  if (url.pathname.startsWith('/api/auth/')) return
  // در آینده می‌توانیم اینجا decode کنیم و روی event.context.user بگذاریم
})
