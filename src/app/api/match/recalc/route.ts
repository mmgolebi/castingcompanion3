import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST() {
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
            id: true,
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

    // Get all active casting calls
    const castingCalls = await prisma.castingCall.findMany({
      where: {
        status: 'ACTIVE',
        submissionDeadline: { gte: new Date() },
      },
    });

    // Recalculate matches (you can implement your matching logic here)
    const matches = castingCalls.length;

    return NextResponse.json({ 
      success: true, 
      matches,
      message: 'Match scores recalculated successfully' 
    });
  } catch (error) {
    console.error('Error recalculating matches:', error);
    return NextResponse.json({ error: 'Failed to recalculate' }, { status: 500 });
  }
}
