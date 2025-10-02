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

    const [recentSubmissions, allSubmissions] = await Promise.all([
      prisma.submission.findMany({
        where: { userId },
        include: {
          call: {
            select: {
              title: true,
              production: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
        take: 5,
      }),
      prisma.submission.findMany({
        where: { userId },
        select: {
          callId: true,
        },
      }),
    ]);

    return NextResponse.json({
      recent: recentSubmissions,
      allCallIds: allSubmissions.map(s => s.callId),
    });
  } catch (error) {
    console.error('Recent submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
