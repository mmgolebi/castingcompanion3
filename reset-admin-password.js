const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  const hashedPassword = await bcryptjs.hash('admin123', 10);
  
  const user = await prisma.user.update({
    where: { email: 'admin@castingcompanion.com' },
    data: { password: hashedPassword }
  });
  
  console.log('Password reset successfully!');
  console.log('Email: admin@castingcompanion.com');
  console.log('New Password: admin123');
  
  await prisma.$disconnect();
}

resetPassword().catch(console.error);
