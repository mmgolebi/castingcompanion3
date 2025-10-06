import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereClause: any = {
      userId: session.user.id,
    };

    const totalSubmissions = await prisma.submission.count({
      where: whereClause,
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const whereClauseWeek: Prisma.SubmissionWhereInput = {
      userId: session.user.id,
      createdAt: { gte: weekAgo },
    };

    const submissionsThisWeek = await prisma.submission.count({
      where: whereClauseWeek,
    });

    const totalMatches = await prisma.castingCall.count({
      where: {
        submissionDeadline: { gte: new Date() },
      },
    });

    const stats = {
      totalSubmissions,
      submissionsThisWeek,
      totalMatches,
      responseRate: totalSubmissions > 0 ? Math.round((submissionsThisWeek / totalSubmissions) * 100) : 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
