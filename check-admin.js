// check-admin.js - بررسی کاربران ADMIN
const { PrismaClient } = require('@prisma/client');

async function checkAdmin() {
  try {
    const prisma = new PrismaClient();
    
    console.log('🔍 بررسی کاربران ADMIN...\n');
    
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, fullName: true, phone: true, role: true }
    });
    
    console.log('👥 کاربران ADMIN موجود:');
    if (admins.length === 0) {
      console.log('   ❌ هیچ کاربر ADMIN یافت نشد');
    } else {
      admins.forEach(admin => {
        console.log(`   ✅ ID: ${admin.id}, نام: ${admin.fullName}, تلفن: ${admin.phone}`);
      });
    }
    
    // بررسی مکانیک‌ها
    console.log('\n🔧 بررسی مکانیک‌ها...');
    const mechanics = await prisma.mechanic.findMany({
      select: { 
        id: true, 
        code: true, 
        qrActive: true,
        user: { select: { fullName: true, phone: true } }
      },
      take: 5
    });
    
    console.log('👨‍🔧 مکانیک‌های موجود (نمونه):');
    if (mechanics.length === 0) {
      console.log('   ❌ هیچ مکانیکی یافت نشد');
    } else {
      mechanics.forEach(mechanic => {
        console.log(`   ✅ ID: ${mechanic.id}, نام: ${mechanic.user.fullName}, کد: ${mechanic.code || 'ندارد'}, QR: ${mechanic.qrActive ? 'فعال' : 'غیرفعال'}`);
      });
    }
    
    await prisma.$disconnect();
    console.log('\n✅ بررسی کامل شد!');
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

checkAdmin();
