import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user?.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get the casting call details
    const castingCall = await prisma.castingCall.findUnique({
      where: { id },
    });

    if (!castingCall) {
      return NextResponse.json({ error: 'Casting call not found' }, { status: 404 });
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        profileId_castingCallId: {
          profileId: user.profile.id,
          castingCallId: id,
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
    }

    // Calculate match score
    const matchScore = calculateMatchScore(user.profile, castingCall);

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        profileId: user.profile.id,
        castingCallId: id,
        submissionMethod: 'MANUAL',
        matchScore,
        status: 'PENDING',
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error submitting:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
