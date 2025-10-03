import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendSubmissionEmail, sendSubmissionConfirmationEmail } from '@/lib/email';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        userId_callId: {
          userId,
          callId: id,
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
    }

    // Get casting call details
    const castingCall = await prisma.castingCall.findUnique({
      where: { id },
    });

    if (!castingCall) {
      return NextResponse.json({ error: 'Casting call not found' }, { status: 404 });
    }

    // Get user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        age: true,
        playableAgeMin: true,
        playableAgeMax: true,
        gender: true,
        state: true,
        city: true,
        unionStatus: true,
        ethnicity: true,
        headshot: true,
        fullBody: true,
        resume: true,
        demoReel: true,
        skills: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        userId,
        callId: id,
        status: 'SENT',
        method: 'MANUAL',
        castingEmail: castingCall.castingEmail,
      },
    });

    // Send email to casting director
    try {
      await sendSubmissionEmail({
        castingEmail: castingCall.castingEmail,
        userProfile,
        castingCall,
        submissionId: submission.id,
      });
      console.log(`Manual submission email sent to ${castingCall.castingEmail}`);
    } catch (emailError) {
      console.error('Failed to send submission email:', emailError);
    }

    // Send confirmation email to user (only for manual submissions)
    try {
      await sendSubmissionConfirmationEmail(
        userProfile.email,
        userProfile.name || 'Actor',
        castingCall
      );
      console.log(`Confirmation email sent to ${userProfile.email}`);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({ 
      success: true,
      submission 
    });
  } catch (error: any) {
    console.error('Submit to casting call error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit' },
      { status: 500 }
    );
  }
}
