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
      return NextResponse.json({ submissions: [] });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        profileId: user.profile.id,
      } as any,
      include: {
        castingCall: {
          select: {
            title: true,
            production: true,
            submissionDeadline: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
