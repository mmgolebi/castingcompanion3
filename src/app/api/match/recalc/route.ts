import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        age: true,
        playableAgeMin: true,
        playableAgeMax: true,
        gender: true,
        state: true,
        city: true,
        unionStatus: true,
        ethnicity: true,
        roleTypesInterested: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get all active casting calls
    const castingCalls = await prisma.castingCall.findMany({
      where: {
        submissionDeadline: {
          gte: new Date(),
        },
      },
    });

    // Recalculate and update submissions
    const updates = [];
    for (const call of castingCalls) {
      const matchScore = calculateMatchScore(user, call);
      
      const submission = await prisma.submission.findUnique({
        where: {
          userId_callId: {
            userId: user.id,
            callId: call.id,
          },
        },
      });

      if (submission) {
        updates.push(
          prisma.submission.update({
            where: { id: submission.id },
            data: { matchScore },
          })
        );
      }
    }

    await Promise.all(updates);

    return NextResponse.json({ 
      success: true,
      updated: updates.length 
    });
  } catch (error: any) {
    console.error('Recalculate matches error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to recalculate matches' },
      { status: 500 }
    );
  }
}
