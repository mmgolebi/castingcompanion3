import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';
import { sendSubmissionEmail, sendSubmissionConfirmationEmail } from '@/lib/email';

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
    const body = await req.json();
    const { coverLetter } = body;

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

    // Create submission with cover letter
    const submission = await prisma.submission.create({
      data: {
        profileId: user.profile.id,
        castingCallId: id,
        submissionMethod: 'MANUAL',
        matchScore,
        status: 'PENDING',
        coverLetter: coverLetter || null,
      },
    });

    // Send emails (async, don't block response)
    Promise.all([
      sendSubmissionEmail({
        castingEmail: castingCall.castingEmail,
        userProfile: {
          name: user.name,
          email: user.email,
          phone: user.profile.phone,
          age: user.profile.age,
          playableAgeMin: user.profile.playableAgeMin,
          playableAgeMax: user.profile.playableAgeMax,
          gender: user.profile.gender,
          city: user.profile.city,
          state: user.profile.state,
          unionStatus: user.profile.unionStatus,
          ethnicity: user.profile.ethnicity,
          skills: user.profile.skills,
          headshot: user.profile.headshot,
          fullBody: user.profile.fullBodyPhoto,
          resume: user.profile.resume,
        },
        castingCall,
        submissionId: submission.id,
        coverLetter: coverLetter || undefined,
      }),
      sendSubmissionConfirmationEmail(
        user.email,
        user.name || 'Actor',
        castingCall
      ),
    ]).catch(err => console.error('Email sending failed:', err));

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error submitting:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
