import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendSubmissionEmail, sendSubmissionConfirmation } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { callId } = await req.json();

    const existing = await prisma.submission.findFirst({
      where: { userId, callId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already submitted to this call' },
        { status: 400 }
      );
    }

    const call = await prisma.castingCall.findUnique({
      where: { id: callId },
    });

    if (!call) {
      return NextResponse.json(
        { error: 'Casting call not found' },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let matchScore = 50;
    if (user.state && call.location.includes(user.state)) matchScore += 20;
    if (call.unionReq === 'ANY' || user.unionStatus === call.unionReq || call.unionReq === 'EITHER') matchScore += 15;
    if (user.age && call.ageMin && call.ageMax && user.age >= call.ageMin && user.age <= call.ageMax) matchScore += 15;
    matchScore = Math.min(matchScore, 100);

    const submission = await prisma.submission.create({
      data: {
        userId,
        callId,
        status: 'SENT',
        method: 'MANUAL',
        matchScore,
        castingEmail: call.castingEmail,
      },
    });

    console.log('🎬 Submission created:', submission.id);
    console.log('📧 Attempting to send emails...');

    // Send emails with better error handling
    try {
      await Promise.all([
        sendSubmissionEmail({
          castingEmail: call.castingEmail,
          userProfile: user,
          castingCall: call,
          submissionId: submission.id,
        }),
        sendSubmissionConfirmation({
          userEmail: user.email,
          userName: user.name || 'Actor',
          castingCall: call,
        }),
      ]);
      console.log('✅ Emails sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Don't fail the submission if emails fail
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'Failed to submit' },
      { status: 500 }
    );
  }
}
