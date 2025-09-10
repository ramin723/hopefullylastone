// server/validators/password.ts
import { z } from 'zod'

/**
 * Schema for setting initial password
 */
export const SetInitialPasswordSchema = z.object({
  password: z.string()
    .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
    .regex(/[a-zA-Z]/, 'رمز عبور باید حداقل یک حرف انگلیسی داشته باشد')
    .regex(/\d/, 'رمز عبور باید حداقل یک رقم داشته باشد')
    .max(128, 'رمز عبور نباید بیش از 128 کاراکتر باشد')
})

/**
 * Schema for changing password
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'رمز عبور فعلی الزامی است'),
  newPassword: z.string()
    .min(8, 'رمز عبور جدید باید حداقل 8 کاراکتر باشد')
    .regex(/[a-zA-Z]/, 'رمز عبور جدید باید حداقل یک حرف انگلیسی داشته باشد')
    .regex(/\d/, 'رمز عبور جدید باید حداقل یک رقم داشته باشد')
    .max(128, 'رمز عبور جدید نباید بیش از 128 کاراکتر باشد')
})

/**
 * Type definitions for TypeScript
 */
export type SetInitialPasswordInput = z.infer<typeof SetInitialPasswordSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
