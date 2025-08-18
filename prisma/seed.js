// prisma/seed.js
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
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

  await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      storeName: 'فروشگاه نمونه',
      city: 'تهران',
      percentDefault: 0.05, // 5% کل کمیسیون
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

  await prisma.mechanic.upsert({
    where: { userId: mechUser.id },
    update: {},
    create: {
      userId: mechUser.id,
      code: 'ABC123',
      qrActive: true,
    },
  });

  console.log('✅ Seed done: admin/vendor/mechanic created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
