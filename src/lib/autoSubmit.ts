import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';

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
      await prisma.submission.create({
        data: {
          profileId: user.profile.id,
          castingCallId: call.id,
          submissionMethod: 'AUTO',
          matchScore,
          status: 'PENDING',
        },
      });
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
      await prisma.submission.create({
        data: {
          profileId: user.profile.id,
          castingCallId: castingCall.id,
          submissionMethod: 'AUTO',
          matchScore,
          status: 'PENDING',
        },
      });
      submitted++;
    }
  }

  return { processed: users.length, submitted };
}
