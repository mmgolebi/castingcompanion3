import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          select: {
            age: true,
            playableAgeMin: true,
            playableAgeMax: true,
            gender: true,
            ethnicity: true,
            unionStatus: true,
            roleTypesInterested: true,
          },
        },
      },
    });

    if (!user?.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get active casting calls
    const castingCalls = await prisma.castingCall.findMany({
      where: {
        status: 'ACTIVE',
        submissionDeadline: { gte: new Date() },
      },
    });

    // Simple match count (you can add matching logic here)
    const matches = castingCalls.length;

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error checking matches:', error);
    return NextResponse.json({ error: 'Failed to check matches' }, { status: 500 });
  }
}
