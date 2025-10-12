import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test actor user
  const hashedPassword = await bcrypt.hash('TestActor123!', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'testactor@detroit.com' },
    update: {},
    create: {
      email: 'testactor@detroit.com',
      password: hashedPassword,
      name: 'Test Actor Detroit',
      role: 'ACTOR',
    },
  });

  // Create profile that will match Detroit casting call (100% match)
  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      age: 28,
      playableAgeMin: 25,
      playableAgeMax: 35,
      gender: 'Male',
      unionStatus: 'NON_UNION',
      city: 'Ann Arbor',
      state: 'Michigan',
      zipCode: '48104',
      ethnicity: 'Caucasian',
      height: 72,
      weight: 180,
      hairColor: 'Brown',
      eyeColor: 'Blue',
      availability: 'Full-time',
      reliableTransportation: true,
      travelWilling: true,
      compensationPreference: 'Paid roles only',
    },
    create: {
      userId: user.id,
      age: 28,
      playableAgeMin: 25,
      playableAgeMax: 35,
      gender: 'Male',
      unionStatus: 'NON_UNION',
      city: 'Ann Arbor',
      state: 'Michigan',
      zipCode: '48104',
      ethnicity: 'Caucasian',
      height: 72,
      weight: 180,
      hairColor: 'Brown',
      eyeColor: 'Blue',
      availability: 'Full-time',
      reliableTransportation: true,
      travelWilling: true,
      compensationPreference: 'Paid roles only',
    },
  });

  console.log('✅ Created test actor: testactor@detroit.com / TestActor123!');
  console.log('   Location: Ann Arbor, Michigan');
  console.log('   This profile should auto-submit to Detroit casting call!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
