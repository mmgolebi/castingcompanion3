import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get submission stats
    const [totalSubmissions, pendingSubmissions, activeCalls, submissions] = await Promise.all([
      prisma.submission.count({
        where: { userId },
      }),
      prisma.submission.count({
        where: { 
          userId,
          status: 'SENT',
        },
      }),
      prisma.castingCall.count({
        where: {
          submissionDeadline: {
            gte: new Date(),
          },
        },
      }),
      prisma.submission.findMany({
        where: { userId },
        select: { matchScore: true },
      }),
    ]);

    // Calculate average match score
    const matchScore = submissions.length > 0
      ? Math.round(submissions.reduce((sum, s) => sum + (s.matchScore || 0), 0) / submissions.length)
      : 0;

    return NextResponse.json({
      totalSubmissions,
      pendingSubmissions,
      activeCalls,
      matchScore,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
