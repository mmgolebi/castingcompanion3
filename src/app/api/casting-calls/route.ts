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
      include: { 
        profile: {
          select: {
            age: true,
            playableAgeMin: true,
            playableAgeMax: true,
            gender: true,
            ethnicity: true,
            unionStatus: true,
            roleTypesInterested: true,
          }
        }
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

    return NextResponse.json({ castingCalls });
  } catch (error) {
    console.error('Error fetching casting calls:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
