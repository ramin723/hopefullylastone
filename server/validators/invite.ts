// server/validators/invite.ts
import { z } from 'zod'

/**
 * Schema for creating a new invite
 */
export const CreateInviteSchema = z.object({
  role: z.enum(['MECHANIC', 'VENDOR']),
  phone: z.string()
    .min(10, 'شماره تلفن باید حداقل 10 رقم باشد')
    .max(15, 'شماره تلفن نباید بیش از 15 رقم باشد')
    .regex(/^[0-9+\-\s]+$/, 'شماره تلفن باید فقط شامل اعداد، +، - و فاصله باشد'),
  fullName: z.string()
    .min(2, 'نام باید حداقل 2 کاراکتر باشد')
    .max(100, 'نام نباید بیش از 100 کاراکتر باشد')
    .optional(),
  city: z.string()
    .min(2, 'شهر باید حداقل 2 کاراکتر باشد')
    .max(50, 'شهر نباید بیش از 50 کاراکتر باشد')
    .optional(),
  specialties: z.string()
    .max(200, 'تخصص‌ها نباید بیش از 200 کاراکتر باشد')
    .optional(),
  storeName: z.string()
    .min(2, 'نام فروشگاه باید حداقل 2 کاراکتر باشد')
    .max(100, 'نام فروشگاه نباید بیش از 100 کاراکتر باشد')
    .optional(),
  addressLine: z.string()
    .max(200, 'آدرس نباید بیش از 200 کاراکتر باشد')
    .optional(),
  province: z.string()
    .max(50, 'استان نباید بیش از 50 کاراکتر باشد')
    .optional(),
  postalCode: z.string()
    .regex(/^[0-9]{10}$/, 'کد پستی باید 10 رقم باشد')
    .optional()
})

/**
 * Schema for invite list query parameters
 */
export const InviteListQuerySchema = z.object({
  role: z.enum(['MECHANIC', 'VENDOR']).optional(),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'USED', 'EXPIRED', 'CANCELLED']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).default(20)
})

/**
 * Schema for accepting an invite
 */
export const AcceptInviteSchema = z.object({
  token: z.string()
    .min(12, 'توکن دعوت نامعتبر است')
    .max(20, 'توکن دعوت نامعتبر است'),
  otpCode: z.string()
    .length(5, 'کد OTP باید 5 رقم باشد')
    .regex(/^\d+$/, 'کد OTP باید فقط شامل اعداد باشد')
})

/**
 * Schema for validating an invite token
 */
export const ValidateInviteSchema = z.object({
  token: z.string()
    .min(12, 'توکن دعوت نامعتبر است')
    .max(20, 'توکن دعوت نامعتبر است')
})

export type CreateInviteInput = z.infer<typeof CreateInviteSchema>
export type InviteListQuery = z.infer<typeof InviteListQuerySchema>
export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>
export type ValidateInviteInput = z.infer<typeof ValidateInviteSchema>
