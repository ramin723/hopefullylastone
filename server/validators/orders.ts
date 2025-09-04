// server/validators/orders.ts
import { z } from 'zod'

export const CreateOrderSchema = z.object({
  customerPhone: z.string().min(10, 'شماره تلفن باید حداقل 10 رقم باشد'),
  note: z.string().optional(),
  items: z.array(z.object({
    title: z.string().min(1, 'عنوان آیتم الزامی است'),
    quantity: z.number().int().min(1, 'تعداد باید حداقل 1 باشد').default(1),
    note: z.string().optional()
  })).min(1, 'حداقل یک آیتم باید وارد شود').max(50, 'حداکثر 50 آیتم مجاز است')
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>

export const OrderCodeSchema = z.object({
  code: z.string().min(12, 'کد سفارش نامعتبر است').max(12, 'کد سفارش نامعتبر است')
})

export type OrderCodeInput = z.infer<typeof OrderCodeSchema>
