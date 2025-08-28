import { z } from 'zod'

export const CreateSettlementSchema = z.object({
  vendorId: z.number().int().positive(),
  mechanicId: z.number().int().positive().optional(),
  from: z.string().min(10), // YYYY-MM-DD
  to: z.string().min(10)
}).refine(v => new Date(v.to) >= new Date(v.from), {
  message: 'to must be >= from',
  path: ['to']
})

export type CreateSettlementInput = z.infer<typeof CreateSettlementSchema>
