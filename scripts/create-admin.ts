import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@castingcompanion.com';
  const password = 'Admin123!';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  
  console.log('✅ Admin user created!');
  console.log('Email:', user.email);
  console.log('Password: Admin123!');
  console.log('Role:', user.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
