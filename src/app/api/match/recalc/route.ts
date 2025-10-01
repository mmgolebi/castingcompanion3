import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assertAuthenticated } from '@/lib/rbac';
import { computeMatch } from '@/lib/matching';
import { sendSubmissionEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await auth();
    assertAuthenticated(session);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user?.profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if user has active subscription
    const canAutoSubmit = ['TRIAL', 'ACTIVE'].includes(user.subStatus);

    // Get all open casting calls
    const calls = await prisma.castingCall.findMany({
      where: {
        submissionDeadline: { gte: new Date() },
      },
    });

    let autoSubmitted = 0;
    const matches = [];

    for (const call of calls) {
      const score = computeMatch(user.profile, call);
      
      matches.push({
        callId: call.id,
        title: call.title,
        score,
      });

      // Auto-submit if score >= 85 and user eligible
      if (canAutoSubmit && score >= 85) {
        try {
          // Check if already submitted
          const existing = await prisma.submission.findUnique({
            where: {
              userId_callId: {
                userId: user.id,
                callId: call.id,
              },
            },
          });

          if (!existing) {
            await prisma.submission.create({
              data: {
                userId: user.id,
                callId: call.id,
                method: 'AUTO',
                status: 'SENT',
                matchScore: score,
                castingEmail: call.castingEmail,
              },
            });

            // Send submission email
            await sendSubmissionEmail({
              castingEmail: call.castingEmail,
              actorName: user.name || user.email,
              actorEmail: user.email,
              actorPhone: user.profile.phone || undefined,
              headshotUrl: user.profile.headshotUrl || undefined,
              resumeUrl: user.profile.resumeUrl || undefined,
              reelLink: user.profile.reelLink || undefined,
              callTitle: call.title,
              production: call.production,
              profile: {
                age: user.profile.age || undefined,
                gender: user.profile.gender || undefined,
                ethnicity: user.profile.ethnicity || undefined,
                unionStatus: user.profile.unionStatus || undefined,
                location: user.profile.locationCity
                  ? `${user.profile.locationCity}, ${user.profile.locationState}`
                  : undefined,
                roleInterests: user.profile.roleInterests || undefined,
                specialSkills: user.profile.specialSkills || undefined,
                instagram: user.profile.instagram || undefined,
                tiktok: user.profile.tiktok || undefined,
                youtube: user.profile.youtube || undefined,
              },
            });

            autoSubmitted++;
          }
        } catch (error: any) {
          // Ignore duplicate errors
          if (error.code !== 'P2002') {
            console.error('Auto-submit error:', error);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalMatches: matches.length,
      autoSubmitted,
      topMatches: matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 10),
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Match recalc error:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate matches' },
      { status: 500 }
    );
  }
}
