import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';
import { sendSubmissionEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();

    const castingCall = await prisma.castingCall.create({
      data: {
        title: data.title,
        production: data.production,
        description: data.description,
        roleType: data.roleType,
        genderReq: data.genderReq,
        ageMin: Number(data.ageMin),
        ageMax: Number(data.ageMax),
        ethnicityReq: data.ethnicityReq || 'ANY',
        location: data.location,
        compensation: data.compensation,
        unionReq: data.unionReq,
        skillsRequired: [],
        shootDates: data.shootDates,
        castingEmail: data.castingEmail,
        submissionDeadline: new Date(data.submissionDeadline),
      },
    });

    console.log('🎬 New casting call created:', castingCall.id);

    // Auto-submit for all users with high match scores
    const activeUsers = await prisma.user.findMany({
      where: {
        onboardingComplete: true,
        subStatus: { in: ['TRIAL', 'ACTIVE'] },
      },
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

    console.log(`📊 Checking ${activeUsers.length} active users for auto-submission`);

    for (const userProfile of activeUsers) {
      const matchScore = calculateMatchScore(userProfile, castingCall);
      console.log(`   User ${userProfile.email}: ${matchScore}% match`);

      if (matchScore >= 85) {
        // Check if already submitted
        const existingSubmission = await prisma.submission.findUnique({
          where: {
            userId_callId: {
              userId: userProfile.id,
              callId: castingCall.id,
            },
          },
        });

        if (!existingSubmission) {
          console.log(`   ✅ Auto-submitting ${userProfile.email} (${matchScore}% match)`);

          // Create submission
          await prisma.submission.create({
            data: {
              userId: userProfile.id,
              callId: castingCall.id,
              status: 'SENT',
              method: 'AUTO',
              matchScore,
              castingEmail: castingCall.castingEmail,
            },
          });

          // Send emails
          try {
            await sendSubmissionEmail({
              castingEmail: castingCall.castingEmail,
              userProfile,
              castingCall,
              submissionId: castingCall.id,
            });
            console.log(`   📧 Submission email sent to ${castingCall.castingEmail}`);
          } catch (emailError) {
            console.error(`   ❌ Failed to send submission email:`, emailError);
          }

          // Send confirmation to user
          // You can add sendSubmissionConfirmation here if you want
        } else {
          console.log(`   ⏭️  User ${userProfile.email} already submitted`);
        }
      }
    }

    return NextResponse.json(castingCall, { status: 201 });
  } catch (error: any) {
    console.error('Create casting call error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create casting call' },
      { status: 500 }
    );
  }
}
