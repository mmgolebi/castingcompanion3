import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assertAuthenticated } from '@/lib/rbac';
import { computeMatch } from '@/lib/matching';
import { sendSubmissionEmail } from '@/lib/email';
import { z } from 'zod';

const createSubmissionSchema = z.object({
  callId: z.string().min(1, 'Casting call ID is required'),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    assertAuthenticated(session);

    const { searchParams } = new URL(req.url);
    const method = searchParams.get('method');
    const status = searchParams.get('status');
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const skip = (page - 1) * pageSize;

    const where: any = {
      userId: session.user.id,
    };

    if (method) where.method = method;
    if (status) where.status = status;

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        castingCall: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    // Filter by search query if provided
    const filteredSubmissions = q
      ? submissions.filter(
          (s) =>
            s.castingCall.title.toLowerCase().includes(q.toLowerCase()) ||
            s.castingCall.production.toLowerCase().includes(q.toLowerCase())
        )
      : submissions;

    const total = await prisma.submission.count({ where });

    return NextResponse.json({
      submissions: filteredSubmissions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    assertAuthenticated(session);

    const body = await req.json();
    const { callId } = createSubmissionSchema.parse(body);

    // Check subscription status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (
      !user ||
      !['TRIAL', 'ACTIVE', 'PAST_DUE'].includes(user.subStatus)
    ) {
      return NextResponse.json(
        { error: 'Active subscription required to submit' },
        { status: 403 }
      );
    }

    // Get casting call
    const call = await prisma.castingCall.findUnique({
      where: { id: callId },
    });

    if (!call) {
      return NextResponse.json(
        { error: 'Casting call not found' },
        { status: 404 }
      );
    }

    // Check if deadline has passed
    if (call.submissionDeadline < new Date()) {
      return NextResponse.json(
        { error: 'Submission deadline has passed' },
        { status: 400 }
      );
    }

    // Get profile and compute match score
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      );
    }

    const matchScore = computeMatch(profile, call);

    // Create submission
    try {
      const submission = await prisma.submission.create({
        data: {
          userId: session.user.id,
          callId,
          method: 'MANUAL',
          status: 'SENT',
          matchScore,
          castingEmail: call.castingEmail,
        },
      });

      // Send email
      await sendSubmissionEmail({
        castingEmail: call.castingEmail,
        actorName: user.name || user.email,
        actorEmail: user.email,
        actorPhone: profile.phone || undefined,
        headshotUrl: profile.headshotUrl || undefined,
        resumeUrl: profile.resumeUrl || undefined,
        reelLink: profile.reelLink || undefined,
        callTitle: call.title,
        production: call.production,
        profile: {
          age: profile.age || undefined,
          gender: profile.gender || undefined,
          ethnicity: profile.ethnicity || undefined,
          unionStatus: profile.unionStatus || undefined,
          location: profile.locationCity
            ? `${profile.locationCity}, ${profile.locationState}`
            : undefined,
          roleInterests: profile.roleInterests || undefined,
          specialSkills: profile.specialSkills || undefined,
          instagram: profile.instagram || undefined,
          tiktok: profile.tiktok || undefined,
          youtube: profile.youtube || undefined,
        },
      });

      return NextResponse.json({ success: true, submission });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Already submitted to this casting call' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create submission error:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}
