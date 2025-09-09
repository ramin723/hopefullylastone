// server/api/_debug/sms-config.get.ts
// DEBUG ENDPOINT - Remove after testing phase
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // فقط ADMIN دسترسی دارد
  const auth = await requireAuth(event, ['ADMIN'])
  
  const config = useRuntimeConfig()
  const { smsProvider, kavenegarApiKey, kavenegarTemplateOtp } = config
  
  // فقط اطلاعات غیرحساس برگردان
  return {
    ok: true,
    provider: smsProvider,
    hasKey: !!kavenegarApiKey,
    template: kavenegarTemplateOtp,
    envNodeEnv: process.env.NODE_ENV || 'development'
  }
})
