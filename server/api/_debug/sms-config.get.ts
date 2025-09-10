// server/api/_debug/sms-config.get.ts
// DEBUG ENDPOINT - Remove after testing phase
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // فقط ADMIN دسترسی دارد
  const auth = await requireAuth(event, ['ADMIN'])
  
  const config = useRuntimeConfig()
  const { smsProvider, kavenegar } = config
  
  // فقط اطلاعات غیرحساس برگردان
  return {
    ok: true,
    provider: smsProvider,
    kavenegar: {
      hasApiKey: !!kavenegar?.apiKey,
      templateOtp: kavenegar?.templateOtp || 'otp-login',
      templateInvite: kavenegar?.templateInvite || 'invite-code',
      devBypass: kavenegar?.devBypass || false
    },
    envNodeEnv: process.env.NODE_ENV || 'development'
  }
})
