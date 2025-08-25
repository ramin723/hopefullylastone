// prisma/seed.js
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

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
  console.log('✅ Admin created:', admin.fullName);

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
  console.log('✅ Vendor created:', vendor.storeName);

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
  console.log('✅ Mechanic created:', mechanic.code);

  // 4) ایجاد تراکنش‌های نمونه برای تست
  console.log('📊 Creating sample transactions...');
  
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

    console.log(`✅ Transaction ${i + 1} created: ${tx.amountTotal.toLocaleString()} تومان`);
  }

  // 5) ایجاد Settlement نمونه برای تست
  console.log('💰 Creating sample settlement...');
  
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
    
    console.log('✅ Settlement created:', settlement.id);
  } else {
    console.log('⚠️ No available transactions found to create settlement');
  }

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📋 Test Data Summary:');
  console.log(`   👤 Admin: ${adminPhone} / ${adminPass}`);
  console.log(`   🏪 Vendor: ${vendorPhone} / ${vendorPass}`);
  console.log(`   🔧 Mechanic: ${mechPhone} / ${mechPass}`);
  console.log(`   💰 Transactions: ${sampleTransactions.length} created`);
  console.log(`   📊 Settlement: 1 created (OPEN status)`);
  console.log('\n🚀 Ready to test Guardrails & Constraints!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
