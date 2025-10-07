import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';
import { sendSubmissionEmail, sendSubmissionConfirmationEmail } from '@/lib/email';

/**
 * Process auto-submissions for a single user against all active casting calls
 * Used when: User logs in or updates profile
 */
export async function processUserAutoSubmissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user?.profile) {
    return { processed: 0, submitted: 0 };
  }

  const castingCalls = await prisma.castingCall.findMany({
    where: {
      status: 'ACTIVE',
      submissionDeadline: { gte: new Date() },
    },
  });

  const existingSubmissions = await prisma.submission.findMany({
    where: { profileId: user.profile.id },
    select: { castingCallId: true },
  });

  const submittedIds = new Set(existingSubmissions.map(s => s.castingCallId));
  let submitted = 0;

  for (const call of castingCalls) {
    if (submittedIds.has(call.id)) continue;

    const matchScore = calculateMatchScore(user.profile, call);

    if (matchScore >= 85) {
      const submission = await prisma.submission.create({
        data: {
          profileId: user.profile.id,
          castingCallId: call.id,
          submissionMethod: 'AUTO',
          matchScore,
          status: 'PENDING',
        },
      });

      // Send emails (don't await to avoid blocking)
      Promise.all([
        sendSubmissionEmail({
          castingEmail: call.castingEmail,
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
          castingCall: call,
          submissionId: submission.id,
        }),
        sendSubmissionConfirmationEmail(
          user.email,
          user.name || 'Actor',
          call
        ),
      ]).catch(err => console.error('Email sending failed:', err));

      submitted++;
    }
  }

  return { processed: castingCalls.length, submitted };
}

/**
 * Process auto-submissions for all users against a single casting call
 * Used when: New casting call is created
 */
export async function processCastingCallAutoSubmissions(castingCallId: string) {
  const castingCall = await prisma.castingCall.findUnique({
    where: { id: castingCallId },
  });

  if (!castingCall) {
    return { processed: 0, submitted: 0 };
  }

  const users = await prisma.user.findMany({
    where: {
      profile: { isNot: null },
    },
    include: { profile: true },
  });

  let submitted = 0;

  for (const user of users) {
    if (!user.profile) continue;

    // Check if already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        profileId_castingCallId: {
          profileId: user.profile.id,
          castingCallId: castingCall.id,
        },
      },
    });

    if (existingSubmission) continue;

    const matchScore = calculateMatchScore(user.profile, castingCall);

    if (matchScore >= 85) {
      const submission = await prisma.submission.create({
        data: {
          profileId: user.profile.id,
          castingCallId: castingCall.id,
          submissionMethod: 'AUTO',
          matchScore,
          status: 'PENDING',
        },
      });

      // Send emails (don't await to avoid blocking)
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
        }),
        sendSubmissionConfirmationEmail(
          user.email,
          user.name || 'Actor',
          castingCall
        ),
      ]).catch(err => console.error('Email sending failed:', err));

      submitted++;
    }
  }

  return { processed: users.length, submitted };
}
