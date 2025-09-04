// server/validators/otp.ts
import { z } from 'zod'

/**
 * Schema for OTP request validation
 */
export const RequestOtpSchema = z.object({
  phone: z.string()
    .min(10, 'شماره تلفن باید حداقل 10 رقم باشد')
    .max(15, 'شماره تلفن نباید بیش از 15 رقم باشد')
    .regex(/^[0-9]+$/, 'شماره تلفن باید فقط شامل اعداد باشد'),
  purpose: z.literal('login')
})

/**
 * Schema for OTP verification validation
 */
export const VerifyOtpSchema = z.object({
  phone: z.string()
    .min(10, 'شماره تلفن باید حداقل 10 رقم باشد')
    .max(15, 'شماره تلفن نباید بیش از 15 رقم باشد')
    .regex(/^[0-9]+$/, 'شماره تلفن باید فقط شامل اعداد باشد'),
  purpose: z.literal('login'),
  code: z.string()
    .length(5, 'کد باید دقیقاً 5 رقم باشد')
    .regex(/^[0-9]+$/, 'کد باید فقط شامل اعداد باشد')
})

/**
 * Type definitions for TypeScript
 */
export type RequestOtpInput = z.infer<typeof RequestOtpSchema>
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>
