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

    const { searchParams } = new URL(req.url);
    const roleType = searchParams.get('roleType');
    const location = searchParams.get('location');
    const unionStatus = searchParams.get('unionStatus');

    const where: any = {
      submissionDeadline: {
        gte: new Date(),
      },
    };

    if (roleType && roleType !== 'all') {
      where.roleType = roleType;
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (unionStatus && unionStatus !== 'all') {
      where.unionReq = unionStatus;
    }

    const castingCalls = await prisma.castingCall.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get user profile for match calculation
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        age: true,
        playableAgeMin: true,
        playableAgeMax: true,
        gender: true,
        state: true,
        city: true,
        unionStatus: true,
        ethnicity: true,
        roleTypesInterested: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's submissions
    const submissions = await prisma.submission.findMany({
      where: { userId: (session.user as any).id },
      select: { callId: true },
    });

    const submittedCallIds = new Set(submissions.map(s => s.callId));

    // Add match scores and submission status
    const callsWithScores = castingCalls.map(call => {
      const matchScore = calculateMatchScore(user, call);
      return {
        ...call,
        matchScore,
        hasSubmitted: submittedCallIds.has(call.id),
      };
    });

    // Sort by match score
    callsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json(callsWithScores);
  } catch (error: any) {
    console.error('Get casting calls error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch casting calls' },
      { status: 500 }
    );
  }
}
