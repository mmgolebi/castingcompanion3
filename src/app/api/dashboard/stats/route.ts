import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

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

    const avgMatchScore = submissions.length > 0
      ? Math.round(submissions.reduce((acc, s) => acc + (s.matchScore || 0), 0) / submissions.length)
      : 0;

    return NextResponse.json({
      totalSubmissions,
      pendingSubmissions,
      activeCalls,
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
