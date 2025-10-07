import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        profile: true
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const castingCalls = await prisma.castingCall.findMany({
      where: {
        submissionDeadline: {
          gte: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get user's submissions
    const submissions = user.profile ? await prisma.submission.findMany({
      where: {
        profileId: user.profile.id,
      },
      select: {
        castingCallId: true,
        submissionMethod: true,
      },
    }) : [];

    const submissionMap = new Map(
      submissions.map(s => [s.castingCallId, s.submissionMethod])
    );

    // Add hasSubmitted flag and calculate match scores
    const enrichedCalls = castingCalls.map(call => {
      const submissionMethod = submissionMap.get(call.id);
      const matchScore = user.profile ? calculateMatchScore(user.profile, call) : 0;
      
      return {
        ...call,
        hasSubmitted: !!submissionMethod,
        submissionMethod: submissionMethod || null,
        matchScore,
      };
    });

    return NextResponse.json(enrichedCalls);
  } catch (error) {
    console.error('Error fetching casting calls:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
