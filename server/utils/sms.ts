// server/utils/sms.ts
import Kavenegar from 'kavenegar'

type OtpParams = { phone: string; code: string; template?: string }

let kapi: any | null = null
function api() {
  if (!kapi) {
    const config = useRuntimeConfig()
    const { smsProvider, kavenegarApiKey } = config
    
    // بررسی کانفیگ SMS
    if (smsProvider !== 'kavenegar' || !kavenegarApiKey) {
      console.warn('[SMS] SMS provider not configured properly', {
        provider: smsProvider,
        hasKey: !!kavenegarApiKey
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'SMS provider not configured'
      })
    }
    
    kapi = Kavenegar.KavenegarApi({ apikey: kavenegarApiKey })
  }
  return kapi
}

function maskPhone(p: string) {
  if (!p) return 'unknown'
  return p.replace(/^(\d{4})\d+(\d{4})$/, '$1***$2')
}

function normalizePhone(phone: string): string {
  if (!phone) return ''
  // حذف فاصله‌ها و کاراکترهای غیرعددی
  const cleaned = phone.replace(/\D/g, '')
  
  // اگر با 98 شروع می‌شود، 0 اضافه کن
  if (cleaned.startsWith('98') && cleaned.length === 12) {
    return '0' + cleaned.substring(2)
  }
  
  // اگر با 09 شروع می‌شود، همان را برگردان
  if (cleaned.startsWith('09') && cleaned.length === 11) {
    return cleaned
  }
  
  // اگر 11 رقم است و با 9 شروع می‌شود، 0 اضافه کن
  if (cleaned.length === 10 && cleaned.startsWith('9')) {
    return '0' + cleaned
  }
  
  return cleaned
}

// تابع عمومی برای ارسال پیامک ساده
export async function sendSms(phone: string, message: string) {
  const devBypass = String(process.env.SMS_DEV_BYPASS || 'false') === 'true'
  const normalizedPhone = normalizePhone(phone)

  if (devBypass) {
    console.info('[SMS DEV BYPASS] SMS would be sent', { phoneMasked: maskPhone(normalizedPhone), message })
    return { ok: true, bypass: true }
  }

  const simpleSend = () =>
    new Promise((resolve, reject) => {
      const base: any = { receptor: normalizedPhone, message }
      const sender = process.env.SMS_FROM
      if (sender && sender.trim()) base.sender = sender  // 👈 فقط اگر واقعا داری
      api().Send(base, (res: any, status: number) => {
        if (status >= 200 && status < 300) resolve(res)
        else reject(Object.assign(new Error('Kavenegar Send failed'), { status, res }))
      })
    })

  try {
    const res = await simpleSend()
    console.info('[SMS] Message sent', { phoneMasked: maskPhone(normalizedPhone) })
    return { ok: true, provider: 'kavenegar', method: 'send', res }
  } catch (e: any) {
    console.error('[SMS] Send failed', { phoneMasked: maskPhone(normalizedPhone), error: e.message })
    throw e
  }
}

export async function sendOtpViaSms({ phone, code, template }: OtpParams) {
  const devBypass = String(process.env.SMS_DEV_BYPASS || 'false') === 'true'
  const config = useRuntimeConfig()
  const tpl = template || config.kavenegarTemplateOtp || 'otp-login'
  const normalizedPhone = normalizePhone(phone)

  if (devBypass) {
    console.info('[SMS DEV BYPASS] OTP would be sent', { phoneMasked: maskPhone(normalizedPhone), code })
    return { ok: true, bypass: true }
  }

  // 1) سعی می‌کنیم با VerifyLookup (الگو) بفرستیم
  const verifyLookup = () =>
    new Promise((resolve, reject) => {
      api().VerifyLookup(
        { receptor: normalizedPhone, token: code, template: tpl },
        (res: any, status: number) => {
          if (status >= 200 && status < 300) resolve(res)
          else reject(Object.assign(new Error('Kavenegar VerifyLookup failed'), { status, res }))
        }
      )
    })

  // 2) اگر الگو خطا داد، fallback: پیامک ساده
  const simpleSend = (message: string) =>
    new Promise((resolve, reject) => {
      const base: any = { receptor: normalizedPhone, message }
      const sender = process.env.SMS_FROM
      if (sender && sender.trim()) base.sender = sender  // 👈 فقط اگر واقعا داری
      api().Send(base, (res: any, status: number) => {
        if (status >= 200 && status < 300) resolve(res)
        else reject(Object.assign(new Error('Kavenegar Send failed'), { status, res }))
      })
    })

  try {
    const res = await verifyLookup()
    console.info('[SMS] OTP sent via VerifyLookup', { phoneMasked: maskPhone(normalizedPhone) })
    return { ok: true, provider: 'kavenegar', method: 'verifylookup', res }
  } catch (e1: any) {
    console.warn('[SMS] VerifyLookup failed, trying fallback Send', {
      phoneMasked: maskPhone(normalizedPhone),
      status: e1?.status,
      errMsg: e1?.message,
      raw: e1?.res || e1 // 👈 اینو اضافه کن تا بدنه‌ی خطا رو ببینیم
    })
    const msg = `کد ورود شما: ${code}`
    const res2 = await simpleSend(msg)
    console.info('[SMS] OTP sent via Send fallback', { phoneMasked: maskPhone(normalizedPhone) })
    return { ok: true, provider: 'kavenegar', method: 'send', res: res2 }
  }
}

type InviteParams = { phone: string; token: string; template?: string }

export async function sendInviteViaLookup({ phone, token, template }: InviteParams) {
  const devBypass = String(process.env.SMS_DEV_BYPASS || 'false') === 'true'
  const config = useRuntimeConfig()
  const tpl = template || 'invite-code' // template پیش‌فرض برای دعوت
  const normalizedPhone = normalizePhone(phone)

  if (devBypass) {
    console.info('[SMS DEV BYPASS] Invite would be sent', { phoneMasked: maskPhone(normalizedPhone), token })
    return { ok: true, bypass: true }
  }

  // 1) سعی می‌کنیم با VerifyLookup (الگو) بفرستیم
  const verifyLookup = () =>
    new Promise((resolve, reject) => {
      api().VerifyLookup(
        { receptor: normalizedPhone, token: token, template: tpl },
        (res: any, status: number) => {
          if (status >= 200 && status < 300) resolve(res)
          else reject(Object.assign(new Error('Kavenegar VerifyLookup failed'), { status, res }))
        }
      )
    })

  // 2) اگر الگو خطا داد، fallback: پیامک ساده
  const simpleSend = (message: string) =>
    new Promise((resolve, reject) => {
      const base: any = { receptor: normalizedPhone, message }
      // هیچ پارامتر sender ست نکن
      api().Send(base, (res: any, status: number) => {
        if (status >= 200 && status < 300) resolve(res)
        else reject(Object.assign(new Error('Kavenegar Send failed'), { status, res }))
      })
    })

  try {
    const res = await verifyLookup()
    console.info('[SMS] Invite sent via VerifyLookup', { phoneMasked: maskPhone(normalizedPhone) })
    return { ok: true, provider: 'kavenegar', method: 'verifylookup', res }
  } catch (e1: any) {
    console.warn('[SMS] VerifyLookup failed, trying fallback Send', {
      phoneMasked: maskPhone(normalizedPhone),
      status: e1?.status,
      errMsg: e1?.message,
      raw: e1?.res || e1
    })
    const msg = `دعوت شما: ${token}`
    const res2 = await simpleSend(msg)
    console.info('[SMS] Invite sent via Send fallback', { phoneMasked: maskPhone(normalizedPhone) })
    return { ok: true, provider: 'kavenegar', method: 'send', res: res2 }
  }
}