// prisma/seed.js
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // PROD: Seed logging minimized for production

  // 1) Admin
  const adminPhone = '09000000000';
  const adminPass = 'admin123';
  const adminHash = await bcrypt.hash(adminPass, 10);

  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      fullName: 'Admin User',
      phone: adminPhone,
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
  });

  // 2) Vendor + User
  const vendorPhone = '09120000001';
  const vendorPass = 'vendor123';
  const vendorHash = await bcrypt.hash(vendorPass, 10);

  const vendorUser = await prisma.user.upsert({
    where: { phone: vendorPhone },
    update: {},
    create: {
      fullName: 'فروشگاه نمونه',
      phone: vendorPhone,
      passwordHash: vendorHash,
      role: UserRole.VENDOR,
    },
  });

  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      storeName: 'فروشگاه نمونه',
      city: 'تهران',
      percentDefault: 0.05, // 5% کل کمیسیون
      status: 'ACTIVE',
    },
  });
  // 3) Mechanic + User
  const mechPhone = '09120000002';
  const mechPass = 'mechanic123';
  const mechHash = await bcrypt.hash(mechPass, 10);

  const mechUser = await prisma.user.upsert({
    where: { phone: mechPhone },
    update: {},
    create: {
      fullName: 'مکانیک نمونه',
      phone: mechPhone,
      passwordHash: mechHash,
      role: UserRole.MECHANIC,
    },
  });

  const mechanic = await prisma.mechanic.upsert({
    where: { userId: mechUser.id },
    update: {},
    create: {
      userId: mechUser.id,
      code: 'ABC123',
      qrActive: true,
    },
  });

  // 4) ایجاد تراکنش‌های نمونه برای تست
  
  // تراکنش‌های مختلف با مبالغ مختلف
  const sampleTransactions = [
    {
      amountTotal: 5000000,      // 5 میلیون تومان
      amountEligible: 4000000,   // 4 میلیون مشمول
      customerPhone: '09130000001',
      note: 'تعمیر موتور سیکلت'
    },
    {
      amountTotal: 15000000,     // 15 میلیون تومان
      amountEligible: 12000000,  // 12 میلیون مشمول
      customerPhone: '09130000002',
      note: 'تعمیر خودرو'
    },
    {
      amountTotal: 8000000,      // 8 میلیون تومان
      amountEligible: 6000000,   // 6 میلیون مشمول
      customerPhone: '09130000003',
      note: 'سرویس دوره‌ای'
    },
    {
      amountTotal: 25000000,     // 25 میلیون تومان
      amountEligible: 20000000,  // 20 میلیون مشمول
      customerPhone: '09130000004',
      note: 'تعمیر اساسی موتور'
    }
  ];

  for (let i = 0; i < sampleTransactions.length; i++) {
    const tx = sampleTransactions[i];
    
    // محاسبه کمیسیون
    const mechanicAmount = Math.floor(tx.amountEligible * 0.03); // 3%
    const platformAmount = Math.floor(tx.amountEligible * 0.02); // 2%

    const transaction = await prisma.transaction.create({
      data: {
        vendorId: vendor.id,
        mechanicId: mechanic.id,
        customerPhone: tx.customerPhone,
        amountTotal: tx.amountTotal,
        amountEligible: tx.amountEligible,
        note: tx.note,
        status: 'PENDING',
        commission: {
          create: {
            rateMechanic: 0.03,
            ratePlatform: 0.02,
            mechanicAmount: mechanicAmount,
            platformAmount: platformAmount
          }
        }
      }
    });

    // PROD: Transaction creation logging removed for production
  }

  // 5) ایجاد Settlement نمونه برای تست
  
  // ابتدا transaction های موجود را دریافت می‌کنیم که هنوز تسویه نشده‌اند
  const availableTransactions = await prisma.transaction.findMany({
    where: { 
      vendorId: vendor.id,
      // فقط تراکنش‌هایی که هنوز در هیچ settlement قرار نگرفته‌اند
      id: {
        notIn: await prisma.settlementItem.findMany({
          select: { transactionId: true }
        }).then(items => items.map(item => item.transactionId))
      }
    },
    take: 2,
    orderBy: { id: 'asc' }
  });
  
  if (availableTransactions.length > 0) {
    const settlement = await prisma.settlement.create({
      data: {
        vendorId: vendor.id,
        periodFrom: new Date('2024-01-01'),
        periodTo: new Date('2024-01-31'),
        totalAmountEligible: 42000000, // 42 میلیون
        totalMechanicAmount: 1260000,  // 1.26 میلیون (3%)
        totalPlatformAmount: 840000,    // 840 هزار (2%)
        status: 'OPEN',
        items: {
          create: availableTransactions.map((tx, index) => ({
            transactionId: tx.id,
            mechanicAmount: index === 0 ? 120000 : 360000,    // مقادیر نمونه
            platformAmount: index === 0 ? 80000 : 240000      // مقادیر نمونه
          }))
        }
      }
    });
    
    // PROD: Settlement creation logging removed for production
  } else {
    // PROD: No transactions warning removed for production
  }

  console.log('\n🎉 Database seed completed successfully!');
  // PROD: Test data summary removed for production
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
