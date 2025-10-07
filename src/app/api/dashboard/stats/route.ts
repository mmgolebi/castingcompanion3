import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user?.profile) {
      return NextResponse.json({
        totalSubmissions: 0,
        autoSubmissions: 0,
        activeCalls: 0,
        avgMatchScore: 0,
      });
    }

    // Get all submissions for this user
    const submissions = await prisma.submission.findMany({
      where: {
        profileId: user.profile.id,
      },
      select: {
        matchScore: true,
        submissionMethod: true,
      },
    });

    const totalSubmissions = submissions.length;
    const autoSubmissions = submissions.filter(s => s.submissionMethod === 'AUTO').length;

    // Calculate average match score
    const avgMatchScore = totalSubmissions > 0
      ? Math.round(submissions.reduce((sum, s) => sum + s.matchScore, 0) / totalSubmissions)
      : 0;

    // Count active casting calls
    const activeCalls = await prisma.castingCall.count({
      where: {
        status: 'ACTIVE',
        submissionDeadline: { gte: new Date() },
      },
    });

    const stats = {
      totalSubmissions,
      autoSubmissions,
      activeCalls,
      avgMatchScore,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
