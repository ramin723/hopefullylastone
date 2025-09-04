// test-prisma.js - تست Prisma client
const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
  console.log('🧪 تست Prisma Client...\n');
  
  try {
    const prisma = new PrismaClient();
    
    // تست 1: بررسی مدل Order
    console.log('1️⃣ بررسی مدل Order:');
    console.log('   prisma.order:', typeof prisma.order);
    console.log('   prisma.orderItem:', typeof prisma.orderItem);
    
    // تست 2: بررسی enum OrderStatus
    console.log('\n2️⃣ بررسی enum OrderStatus:');
    console.log('   PENDING:', 'PENDING');
    console.log('   CONSUMED:', 'CONSUMED');
    console.log('   CANCELLED:', 'CANCELLED');
    console.log('   EXPIRED:', 'EXPIRED');
    
    // تست 3: بررسی schema
    console.log('\n3️⃣ بررسی schema:');
    const dmmf = prisma._dmmf;
    const modelNames = dmmf.modelMap ? Object.keys(dmmf.modelMap) : 'N/A';
    console.log('   مدل‌های موجود:', modelNames);
    
    await prisma.$disconnect();
    console.log('\n✅ تست Prisma کامل شد!');
    
  } catch (error) {
    console.error('❌ خطا در تست Prisma:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPrisma();
