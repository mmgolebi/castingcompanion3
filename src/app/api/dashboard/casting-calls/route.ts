import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const roleType = searchParams.get('roleType') || 'ALL';
    const location = searchParams.get('location') || '';
    const union = searchParams.get('union') || 'ALL';

    const skip = (page - 1) * limit;

    // Get user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        age: true,
        playableAgeMin: true,
        playableAgeMax: true,
        gender: true,
        state: true,
        city: true,
        unionStatus: true,
        ethnicity: true,
        roleTypesInterested: true,
      },
    });

    // Get user's submissions
    const userSubmissions = await prisma.submission.findMany({
      where: { userId },
      select: { callId: true },
    });
    const submittedCallIds = new Set(userSubmissions.map((s) => s.callId));

    // Build where clause
    const where: any = {
      submissionDeadline: {
        gte: new Date(),
      },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { production: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleType !== 'ALL') {
      where.roleType = roleType;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (union !== 'ALL') {
      where.unionReq = union;
    }

    const [calls, totalCount] = await Promise.all([
      prisma.castingCall.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.castingCall.count({ where }),
    ]);

    // Calculate match scores and check if auto-submitted
    const callsWithScores = await Promise.all(
      calls.map(async (call) => {
        const matchScore = userProfile ? calculateMatchScore(userProfile, call) : 0;
        
        // Check if this was auto-submitted
        const submission = await prisma.submission.findUnique({
          where: {
            userId_callId: {
              userId,
              callId: call.id,
            },
          },
          select: { method: true },
        });

        return {
          ...call,
          matchScore,
          wasAutoSubmitted: submission?.method === 'AUTO',
        };
      })
    );

    return NextResponse.json({
      calls: callsWithScores,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Get casting calls error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch casting calls' },
      { status: 500 }
    );
  }
}
