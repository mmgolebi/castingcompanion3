import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // Check if user is admin
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const castingCalls = [
      // Alabama
      {
        title: 'Supporting Role - Southern Drama Film',
        production: 'Alabama Independent Films',
        description: 'Seeking talented actor for supporting role in independent drama about a small-town Alabama family. Character is a local shop owner with Southern charm and complex backstory. Shooting in Birmingham area. 10-day shoot.',
        roleType: 'SUPPORTING',
        location: 'Birmingham, AL',
        compensation: '$150-200/day',
        submissionDeadline: new Date('2025-10-31'),
        shootingDates: 'November 15-25, 2025',
        ageRangeMin: 35,
        ageRangeMax: 55,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'NON_UNION',
        castingEmail: 'casting@alabamafilms.com',
        status: 'ACTIVE'
      },
      
      // California
      {
        title: 'Co-Star - Network Medical Drama',
        production: 'ABC Studios',
        description: 'Casting co-star role for established network medical drama. Character is a patient with compelling backstory. Strong emotional range required. Shoots in Los Angeles. SAG rates apply.',
        roleType: 'CO_STAR',
        location: 'Los Angeles, CA',
        compensation: 'SAG Scale',
        submissionDeadline: new Date('2025-10-25'),
        shootingDates: 'November 12-14, 2025',
        ageRangeMin: 30,
        ageRangeMax: 50,
        gender: 'FEMALE',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@abcstudios.com',
        status: 'ACTIVE'
      },
      
      // Georgia
      {
        title: 'Recurring Role - Cable TV Series',
        production: 'FX Productions',
        description: 'Casting recurring character for second season of cable drama series. Character appears in 6 episodes. Strong dramatic chops required. Atlanta-based production.',
        roleType: 'SUPPORTING',
        location: 'Atlanta, GA',
        compensation: '$3,000/episode',
        submissionDeadline: new Date('2025-11-05'),
        shootingDates: 'December 2025 - February 2026',
        ageRangeMin: 28,
        ageRangeMax: 42,
        gender: 'MALE',
        ethnicity: 'BLACK',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'casting@fxatlanta.com',
        status: 'ACTIVE'
      },
      
      // New York
      {
        title: 'Law & Order: SVU - Guest Star',
        production: 'Wolf Entertainment',
        description: 'Dick Wolf production casting guest star role for SVU episode. Strong dramatic range required. 5-day shoot commitment.',
        roleType: 'GUEST_STAR',
        location: 'New York City, NY',
        compensation: 'SAG Scale + 10%',
        submissionDeadline: new Date('2025-10-22'),
        shootingDates: 'November 5-12, 2025',
        ageRangeMin: 30,
        ageRangeMax: 45,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'svu@wolfent.com',
        status: 'ACTIVE'
      },
      
      // Texas
      {
        title: 'Friday Night Lights Reboot',
        production: 'Universal Television',
        description: 'New series inspired by FNL universe. Seeking Texas actors for high school football drama. Multiple leads and supporting roles.',
        roleType: 'LEAD',
        location: 'Austin, TX',
        compensation: 'SAG Scale',
        submissionDeadline: new Date('2025-11-10'),
        shootingDates: 'December 2025 - April 2026',
        ageRangeMin: 14,
        ageRangeMax: 50,
        gender: 'ANY',
        ethnicity: 'ANY',
        unionStatus: 'SAG_AFTRA',
        castingEmail: 'fnl@universal.com',
        status: 'ACTIVE'
      },
    ];

    const created = await prisma.castingCall.createMany({
      data: castingCalls,
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      message: `Successfully seeded ${created.count} casting calls`,
      count: created.count 
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed casting calls',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
