// server/validators/transactions.ts
import { z } from 'zod'

export const CreateTxSchema = z.object({
  mechanicCode: z.string().min(3, 'mechanicCode required'),
  customerPhone: z.string().min(5, 'customerPhone too short'),
  amountTotal: z.number().int().positive('amountTotal must be > 0'),
  amountEligible: z.number().int().positive('amountEligible must be > 0'),
  note: z.string().optional(),
  orderCode: z.string().optional() // Optional order code for consuming orders
}).refine(d => d.amountEligible <= d.amountTotal, {
  message: 'amountEligible must be <= amountTotal',
  path: ['amountEligible']
})

export type CreateTxInput = z.infer<typeof CreateTxSchema>
