// server/utils/sms.ts
import { createRequestLogger } from './logger'
import { maskPhone } from './rateLimiter'

/**
 * SMS adapter interface
 * Currently a stub implementation for development
 * In production, this should be replaced with actual SMS provider
 */
export async function sendSms(phone: string, message: string): Promise<void> {
  const logger = createRequestLogger('sms-sender')
  
  try {
    // PROD: Replace with actual SMS provider integration
    // For now, just log the SMS content (without sensitive data)
    logger.info('SMS sent successfully', {
      phone: maskPhone(phone),
      messageLength: message.length,
      // Never log the actual message content for security
    })
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // In production, you would call your SMS provider here:
    // await smsProvider.send(phone, message)
    
  } catch (error) {
    logger.error('SMS sending failed', {
      phone: maskPhone(phone),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    // Don't expose internal errors to the client
    // Just throw a generic error
    throw new Error('Failed to send SMS')
  }
}

/**
 * Generate SMS message for OTP
 * @param code OTP code (will be included in message)
 * @param purpose Purpose of the OTP (login, signup, etc.)
 * @returns Formatted SMS message
 */
export function generateOtpMessage(code: string, purpose: string = 'login'): string {
  const purposeText = purpose === 'login' ? 'ورود' : 'تأیید'
  return `کد ${purposeText} شما: ${code}\nاین کد تا 4 دقیقه معتبر است.`
}
