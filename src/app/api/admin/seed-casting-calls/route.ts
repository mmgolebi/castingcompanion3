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

    const userId = (session.user as any).id;

    // Test with just one casting call first
    const testCall = {
      title: 'Test Casting Call',
      description: 'This is a test casting call',
      projectType: 'FEATURE_FILM',
      production: 'Test Productions',
      location: 'Los Angeles, CA',
      shootingStartDate: new Date('2025-12-01'),
      shootingEndDate: new Date('2025-12-15'),
      submissionDeadline: new Date('2025-11-15'),
      compensation: '$200/day',
      unionStatus: 'NON_UNION',
      ageRangeMin: 25,
      ageRangeMax: 45,
      gender: 'ANY',
      ethnicity: 'ANY',
      roleType: 'LEAD',
      experienceRequired: 'SOME_EXPERIENCE',
      expiresAt: new Date('2025-11-20'),
      castingEmail: 'test@test.com',
      userId: userId
    };

    const created = await prisma.castingCall.create({
      data: testCall
    });

    return NextResponse.json({ 
      message: `Successfully created test casting call`,
      count: 1,
      data: created
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
