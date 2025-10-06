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
      include: { profile: true },
    });

    if (!user?.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get total submissions
    const totalSubmissions = await prisma.submission.count({
      where: { profileId: user.profile.id },
    });

    // Get submissions this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const submissionsThisWeek = await prisma.submission.count({
      where: {
        profileId: user.profile.id,
        createdAt: { gte: weekAgo },
      },
    });

    // Get total matches (casting calls user is eligible for)
    const totalMatches = await prisma.castingCall.count({
      where: {
        status: 'ACTIVE',
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
