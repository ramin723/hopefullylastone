// server/utils/sms.ts
import Kavenegar from 'kavenegar'

type OtpParams = { phone: string; code: string; template?: string }
type InviteParams = { phone: string; token: string; template?: string }

let kapi: any | null = null
function api() {
  if (!kapi) {
    const config = useRuntimeConfig()
    const { smsProvider, kavenegar } = config
    
    // بررسی کانفیگ SMS
    if (smsProvider !== 'kavenegar' || !kavenegar?.apiKey) {
      console.warn('[SMS] SMS provider not configured properly', {
        provider: smsProvider,
        hasKey: !!kavenegar?.apiKey
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'SMS provider not configured'
      })
    }
    
    kapi = Kavenegar.KavenegarApi({ apikey: kavenegar.apiKey })
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

// Map خطاهای Kavenegar به پیام‌های کاربرپسند
function mapKavenegarError(status: number, response?: any): { statusCode: number; message: string } {
  switch (status) {
    case 400:
      return { statusCode: 400, message: 'درخواست نامعتبر است' }
    case 401:
      return { statusCode: 401, message: 'احراز هویت ناموفق' }
    case 403:
      return { statusCode: 403, message: 'دسترسی غیرمجاز' }
    case 404:
      return { statusCode: 404, message: 'سرویس یافت نشد' }
    case 412:
      return { statusCode: 412, message: 'شماره تلفن نامعتبر است' }
    case 413:
      return { statusCode: 413, message: 'پیام خیلی طولانی است' }
    case 422:
      return { statusCode: 422, message: 'الگوی پیامک یافت نشد' }
    case 429:
      return { statusCode: 429, message: 'تعداد درخواست‌ها بیش از حد مجاز است' }
    case 500:
      return { statusCode: 500, message: 'خطای داخلی سرور' }
    case 502:
      return { statusCode: 502, message: 'سرویس پیامک موقتاً در دسترس نیست' }
    case 503:
      return { statusCode: 503, message: 'سرویس پیامک موقتاً در دسترس نیست' }
    default:
      return { statusCode: 502, message: 'ارسال پیامک موقتاً با مشکل مواجه شد' }
  }
}

// تابع اصلی برای ارسال OTP فقط از طریق VerifyLookup
export async function sendOtpViaVerifyLookup({ phone, code, template }: OtpParams) {
  const config = useRuntimeConfig()
  const devBypass = config.kavenegar?.devBypass || false
  const tpl = template || config.kavenegar?.templateOtp || 'otp-login'
  const normalizedPhone = normalizePhone(phone)

  if (devBypass) {
    console.info('[SMS DEV BYPASS] OTP would be sent', { 
      phoneMasked: maskPhone(normalizedPhone),
      template: tpl
    })
    return { ok: true, bypass: true }
  }

  try {
    const result = await new Promise((resolve, reject) => {
      api().VerifyLookup(
        { receptor: normalizedPhone, token: code, template: tpl },
        (res: any, status: number) => {
          if (status >= 200 && status < 300) {
            resolve({ res, status })
          } else {
            reject(Object.assign(new Error('Kavenegar VerifyLookup failed'), { status, res }))
          }
        }
      )
    }) as { res: any; status: number }

    console.info('[SMS] OTP sent via VerifyLookup', { 
      phoneMasked: maskPhone(normalizedPhone),
      template: tpl,
      status: result.status
    })
    
    return { ok: true, provider: 'kavenegar', method: 'verifylookup', res: result.res }
  } catch (error: any) {
    const errorInfo = mapKavenegarError(error?.status || 500, error?.res)
    
    console.error('[SMS] VerifyLookup failed', {
      phoneMasked: maskPhone(normalizedPhone),
      template: tpl,
      status: error?.status,
      error: error?.message
    })
    
    // اگر سرویس status/errMsg می‌دهد، در سطح debug لاگ کن
    if (error?.res && typeof error.res === 'object') {
      console.debug('[SMS DEBUG] Kavenegar response details', {
        phoneMasked: maskPhone(normalizedPhone),
        template: tpl,
        response: error.res
      })
    }
    
    throw createError({
      statusCode: errorInfo.statusCode,
      statusMessage: 'SMS Service Unavailable',
      message: errorInfo.message
    })
  }
}

// تابع اصلی برای ارسال Invite فقط از طریق VerifyLookup
export async function sendInviteViaVerifyLookup({ phone, token, template }: InviteParams) {
  const config = useRuntimeConfig()
  const devBypass = config.kavenegar?.devBypass || false
  const tpl = template || config.kavenegar?.templateInvite || 'invite-code'
  const normalizedPhone = normalizePhone(phone)

  if (devBypass) {
    console.info('[SMS DEV BYPASS] Invite would be sent', { 
      phoneMasked: maskPhone(normalizedPhone),
      template: tpl
    })
    return { ok: true, bypass: true }
  }

  try {
    const result = await new Promise((resolve, reject) => {
      api().VerifyLookup(
        { receptor: normalizedPhone, token: token, template: tpl },
        (res: any, status: number) => {
          if (status >= 200 && status < 300) {
            resolve({ res, status })
          } else {
            reject(Object.assign(new Error('Kavenegar VerifyLookup failed'), { status, res }))
          }
        }
      )
    }) as { res: any; status: number }

    console.info('[SMS] Invite sent via VerifyLookup', { 
      phoneMasked: maskPhone(normalizedPhone),
      template: tpl,
      status: result.status
    })
    
    return { ok: true, provider: 'kavenegar', method: 'verifylookup', res: result.res }
  } catch (error: any) {
    const errorInfo = mapKavenegarError(error?.status || 500, error?.res)
    
    console.error('[SMS] VerifyLookup failed', {
      phoneMasked: maskPhone(normalizedPhone),
      template: tpl,
      status: error?.status,
      error: error?.message
    })
    
    // اگر سرویس status/errMsg می‌دهد، در سطح debug لاگ کن
    if (error?.res && typeof error.res === 'object') {
      console.debug('[SMS DEBUG] Kavenegar response details', {
        phoneMasked: maskPhone(normalizedPhone),
        template: tpl,
        response: error.res
      })
    }
    
    throw createError({
      statusCode: errorInfo.statusCode,
      statusMessage: 'SMS Service Unavailable',
      message: errorInfo.message
    })
  }
}

// Backward compatibility aliases
export const sendOtpViaSms = sendOtpViaVerifyLookup
export const sendInviteViaLookup = sendInviteViaVerifyLookup

// Debug helper function for ADMIN testing - فقط VerifyLookup
export async function kavenegarVerifyLookupDebug(params: {
  receptor: string;
  template: string;
  token: string;
}): Promise<{ 
  ok: boolean; 
  provider: 'kavenegar'; 
  attempted: 'verifylookup'; 
  normalized: string; 
  masked: string; 
  template: string; 
  tokenSample: string; 
  raw?: any; 
  status?: number; 
  error?: string;
  devBypass?: boolean;
}> {
  const config = useRuntimeConfig()
  const { kavenegar } = config
  const normalized = normalizePhone(params.receptor)
  const masked = maskPhone(normalized)
  const tokenSample = params.token ? '***' : ''

  // Check config sanity
  if (!kavenegar?.apiKey) {
    return {
      ok: false,
      provider: 'kavenegar',
      attempted: 'verifylookup',
      normalized,
      masked,
      template: params.template,
      tokenSample,
      error: 'Kavenegar API key not configured'
    }
  }

  const devBypass = kavenegar?.devBypass || false

  if (devBypass) {
    console.info('[SMS DEBUG] verifylookup template=' + params.template + ' status=bypass phone=' + masked + ' ok=true')
    return {
      ok: true,
      provider: 'kavenegar',
      attempted: 'verifylookup',
      normalized,
      masked,
      template: params.template,
      tokenSample,
      devBypass: true
    }
  }

  try {
    const result = await new Promise((resolve, reject) => {
      api().VerifyLookup(
        { 
          receptor: normalized, 
          token: params.token, 
          template: params.template 
        },
        (res: any, status: number) => {
          resolve({ res, status })
        }
      )
    }) as { res: any; status: number }

    const success = result.status >= 200 && result.status < 300
    const logLevel = success ? 'info' : 'warn'
    const statusStr = result.status?.toString() || 'na'
    
    console[logLevel]('[SMS DEBUG] verifylookup template=' + params.template + ' status=' + statusStr + ' phone=' + masked + ' ok=' + success)

    return {
      ok: success,
      provider: 'kavenegar',
      attempted: 'verifylookup',
      normalized,
      masked,
      template: params.template,
      tokenSample,
      raw: result.res,
      status: result.status,
      error: success ? undefined : `HTTP ${result.status}`
    }
  } catch (error: any) {
    console.warn('[SMS DEBUG] verifylookup template=' + params.template + ' status=error phone=' + masked + ' ok=false')
    
    return {
      ok: false,
      provider: 'kavenegar',
      attempted: 'verifylookup',
      normalized,
      masked,
      template: params.template,
      tokenSample,
      error: error?.message || 'Unknown error'
    }
  }
}