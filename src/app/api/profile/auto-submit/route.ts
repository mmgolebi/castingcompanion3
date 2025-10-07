import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';

async function handleAutoSubmit() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user?.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const castingCalls = await prisma.castingCall.findMany({
      where: {
        status: 'ACTIVE',
        submissionDeadline: { gte: new Date() },
      },
    });

    const existingSubmissions = await prisma.submission.findMany({
      where: {
        profileId: user.profile.id,
      },
      select: {
        castingCallId: true,
      },
    });

    const submittedIds = new Set(existingSubmissions.map(s => s.castingCallId));
    const autoSubmissions = [];
    const debugInfo = [];

    for (const call of castingCalls) {
      const matchScore = calculateMatchScore(user.profile, call);
      
      debugInfo.push({
        title: call.title,
        location: call.location,
        matchScore,
        alreadySubmitted: submittedIds.has(call.id),
        willAutoSubmit: matchScore >= 85 && !submittedIds.has(call.id)
      });

      if (submittedIds.has(call.id)) continue;

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

        autoSubmissions.push({
          callTitle: call.title,
          matchScore,
          submissionId: submission.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      autoSubmissions: autoSubmissions.length,
      details: autoSubmissions,
      debug: debugInfo,
      profile: {
        state: user.profile.state,
        city: user.profile.city,
        age: user.profile.currentAge,
        playableAge: `${user.profile.playableAgeMin}-${user.profile.playableAgeMax}`,
        gender: user.profile.gender,
        unionStatus: user.profile.unionStatus,
      }
    });
  } catch (error) {
    console.error('Error with auto-submission:', error);
    return NextResponse.json({ error: 'Failed to auto-submit' }, { status: 500 });
  }
}

export async function GET() {
  return handleAutoSubmit();
}

export async function POST() {
  return handleAutoSubmit();
}
