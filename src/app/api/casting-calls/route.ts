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
    const { searchParams } = new URL(req.url);
    
    const roleType = searchParams.get('roleType');
    const location = searchParams.get('location');
    const unionStatus = searchParams.get('unionStatus');

    const user = await prisma.user.findUnique({
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const where: any = {
      submissionDeadline: {
        gte: new Date(),
      },
    };

    if (roleType) where.roleType = roleType;
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }
    if (unionStatus) where.unionStatus = unionStatus;

    const castingCalls = await prisma.castingCall.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const submissions = await prisma.submission.findMany({
      where: { userId },
      select: { 
        callId: true,
        method: true,
      },
    });

    const submissionMap = new Map(submissions.map(s => [s.callId, s.method]));

    const callsWithScores = castingCalls.map(call => {
      const matchScore = calculateMatchScore(user, call);
      const hasSubmitted = submissionMap.has(call.id);
      const submissionMethod = submissionMap.get(call.id);
      
      return {
        ...call,
        matchScore,
        hasSubmitted,
        submissionMethod,
      };
    });

    callsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json(callsWithScores);
  } catch (error: any) {
    console.error('Error fetching casting calls:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch casting calls' },
      { status: 500 }
    );
  }
}
