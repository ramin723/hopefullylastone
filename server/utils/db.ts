// server/utils/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'], // می‌تونیم بعداً info هم اضافه کنیم
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
