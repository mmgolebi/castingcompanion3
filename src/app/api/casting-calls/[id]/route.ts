import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const castingCall = await prisma.castingCall.findUnique({
      where: { id },
    });

    if (!castingCall) {
      return NextResponse.json({ error: 'Casting call not found' }, { status: 404 });
    }

    // Get user profile data
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate match score
    const matchScore = calculateMatchScore(user, castingCall);

    // Check if already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        userId_callId: {
          userId: (session.user as any).id,
          callId: id,
        },
      },
    });

    return NextResponse.json({
      ...castingCall,
      matchScore,
      hasSubmitted: !!existingSubmission,
    });
  } catch (error: any) {
    console.error('Get casting call error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch casting call' },
      { status: 500 }
    );
  }
}
