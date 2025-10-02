import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing casting calls
  await prisma.castingCall.deleteMany();

  const castingCalls = [
    {
      title: 'Lead Role - Drama Series',
      production: 'Chicago Med',
      description: 'Seeking a lead actor for medical drama series. Character is a passionate surgeon.',
      roleType: 'LEAD',
      genderReq: 'ANY',
      ageMin: 30,
      ageMax: 45,
      ethnicityReq: 'ANY',
      location: 'Chicago, IL',
      compensation: '$5,000/episode',
      unionReq: 'SAG_AFTRA',
      skillsRequired: ['Drama', 'Medical Knowledge'],
      shootDates: 'January-March 2025',
      castingEmail: 'casting@chicagomed.com',
      submissionDeadline: new Date('2025-12-31'),
    },
    {
      title: 'Supporting Role - Comedy Film',
      production: 'Laugh Track',
      description: 'Looking for comedic talent for supporting role in feature film.',
      roleType: 'SUPPORTING',
      genderReq: 'ANY',
      ageMin: 25,
      ageMax: 40,
      ethnicityReq: 'ANY',
      location: 'Los Angeles, CA',
      compensation: '$3,000 + backend',
      unionReq: 'EITHER',
      skillsRequired: ['Comedy', 'Improvisation'],
      shootDates: 'February 2025',
      castingEmail: 'casting@laughtrack.com',
      submissionDeadline: new Date('2025-12-15'),
    },
    {
      title: 'Commercial - National Brand',
      production: 'Nike Advertisement',
      description: 'Athletic talent needed for national commercial campaign.',
      roleType: 'COMMERCIAL',
      genderReq: 'ANY',
      ageMin: 18,
      ageMax: 35,
      ethnicityReq: 'ANY',
      location: 'New York, NY',
      compensation: '$2,500 + usage fees',
      unionReq: 'SAG_AFTRA',
      skillsRequired: ['Sports', 'Fitness'],
      shootDates: 'December 2024',
      castingEmail: 'casting@nike.com',
      submissionDeadline: new Date('2025-11-30'),
    },
    {
      title: 'Background - Action Film',
      production: 'Fast & Furious 11',
      description: 'Seeking background actors for high-octane action sequences.',
      roleType: 'BACKGROUND',
      genderReq: 'ANY',
      ageMin: 21,
      ageMax: 50,
      ethnicityReq: 'ANY',
      location: 'Atlanta, GA',
      compensation: '$150/day',
      unionReq: 'NON_UNION',
      skillsRequired: [],
      shootDates: 'January-April 2025',
      castingEmail: 'casting@fastandfurious.com',
      submissionDeadline: new Date('2026-01-15'),
    },
    {
      title: 'Independent Film - Lead Detective Role',
      production: 'Motor City Mystery',
      description: 'Seeking lead actor for indie crime thriller set in Detroit. Character is a determined detective investigating corruption. Strong dramatic skills required.',
      roleType: 'LEAD',
      genderReq: 'MALE',
      ageMin: 20,
      ageMax: 35,
      ethnicityReq: 'ANY',
      location: 'Detroit, MI',
      compensation: '$8,000 + backend',
      unionReq: 'EITHER',
      skillsRequired: ['Drama', 'Acting'],
      shootDates: 'March-April 2025',
      castingEmail: 'casting@motorcitymystery.com',
      submissionDeadline: new Date('2026-01-15'),
    },
  ];

  // Create more variety
  for (let i = 0; i < 15; i++) {
    const roleTypes = ['LEAD', 'SUPPORTING', 'BACKGROUND', 'EXTRA', 'COMMERCIAL'];
    const locations = ['Los Angeles, CA', 'New York, NY', 'Atlanta, GA', 'Chicago, IL', 'Miami, FL', 'Austin, TX', 'Detroit, MI'];
    const productions = ['Netflix Series', 'HBO Drama', 'Indie Film', 'Network TV', 'Streaming Special'];
    const unions = ['SAG_AFTRA', 'NON_UNION', 'EITHER'];

    castingCalls.push({
      title: `${roleTypes[i % roleTypes.length]} - ${productions[i % productions.length]}`,
      production: `Production ${i + 6}`,
      description: `Seeking talented actors for exciting new project. Great opportunity for the right person.`,
      roleType: roleTypes[i % roleTypes.length],
      genderReq: 'ANY',
      ageMin: 20 + (i % 3) * 10,
      ageMax: 40 + (i % 3) * 10,
      ethnicityReq: 'ANY',
      location: locations[i % locations.length],
      compensation: `$${500 + i * 200}/day`,
      unionReq: unions[i % unions.length],
      skillsRequired: [],
      shootDates: 'TBD 2025',
      castingEmail: `casting${i}@example.com`,
      submissionDeadline: new Date('2026-02-01'),
    });
  }

  // Create all casting calls
  for (const call of castingCalls) {
    await prisma.castingCall.create({ data: call });
  }

  console.log(`✅ Created ${castingCalls.length} demo casting calls`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
