import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get user profile for match calculations
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        age: true,
        playableAgeMin: true,
        playableAgeMax: true,
        gender: true,
        state: true,
        city: true,
        unionStatus: true,
        ethnicity: true,
      },
    });

    const [totalSubmissions, pendingSubmissions, activeCalls] = await Promise.all([
      prisma.submission.count({
        where: { userId },
      }),
      prisma.submission.count({
        where: {
          userId,
          status: 'SENT',
        },
      }),
      prisma.castingCall.findMany({
        where: {
          submissionDeadline: {
            gte: new Date(),
          },
        },
      }),
    ]);

    // Calculate average match score from all active casting calls
    let avgMatchScore = 0;
    if (userProfile && activeCalls.length > 0) {
      const matchScores = activeCalls.map(call => calculateMatchScore(userProfile, call));
      avgMatchScore = Math.round(matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length);
    }

    return NextResponse.json({
      totalSubmissions,
      pendingSubmissions,
      activeCalls: activeCalls.length,
      avgMatchScore,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
