import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user (casting director)
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'director@test.com' },
    update: {},
    create: {
      email: 'director@test.com',
      password: hashedPassword,
      role: Role.ADMIN,
      name: 'Test Director',
    },
  });

  console.log('Created admin/director:', admin.email);

  // Create actor
  const actor = await prisma.user.upsert({
    where: { email: 'actor@test.com' },
    update: {},
    create: {
      email: 'actor@test.com',
      password: hashedPassword,
      role: Role.ACTOR,
      name: 'Test Actor',
    },
  });

  console.log('Created actor:', actor.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
