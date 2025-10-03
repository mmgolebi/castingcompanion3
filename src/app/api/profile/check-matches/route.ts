import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';
import { sendSubmissionEmail } from '@/lib/email';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        playableAgeMin: true,
        playableAgeMax: true,
        gender: true,
        state: true,
        city: true,
        unionStatus: true,
        ethnicity: true,
        roleTypesInterested: true,
        phone: true,
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

    // Get all active casting calls
    const castingCalls = await prisma.castingCall.findMany({
      where: {
        submissionDeadline: {
          gte: new Date(),
        },
      },
    });

    console.log(`Checking ${castingCalls.length} casting calls for auto-submission after profile update`);

    let newSubmissions = 0;

    // Auto-submit to matching casting calls
    for (const call of castingCalls) {
      const matchScore = calculateMatchScore(userProfile, call);
      console.log(`Match score for ${call.title}: ${matchScore}%`);

      if (matchScore >= 85) {
        // Check if already submitted
        const existingSubmission = await prisma.submission.findUnique({
          where: {
            userId_callId: {
              userId: userProfile.id,
              callId: call.id,
            },
          },
        });

        if (existingSubmission) {
          console.log(`Already submitted to ${call.title}, skipping`);
          continue;
        }

        console.log(`Auto-submitting to: ${call.title}`);

        await prisma.submission.create({
          data: {
            userId: userProfile.id,
            callId: call.id,
            status: 'SENT',
            method: 'AUTO',
            matchScore,
            castingEmail: call.castingEmail,
          },
        });

        newSubmissions++;

        try {
          await sendSubmissionEmail({
            castingEmail: call.castingEmail,
            userProfile,
            castingCall: call,
            submissionId: call.id,
          });
          console.log(`Auto-submission email sent for ${call.title}`);
        } catch (emailError) {
          console.error('Failed to send auto-submission email:', emailError);
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      newSubmissions,
      message: newSubmissions > 0 
        ? `Automatically submitted to ${newSubmissions} new matching casting call${newSubmissions > 1 ? 's' : ''}`
        : 'No new matching casting calls found'
    });
  } catch (error: any) {
    console.error('Check matches error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check matches' },
      { status: 500 }
    );
  }
}
