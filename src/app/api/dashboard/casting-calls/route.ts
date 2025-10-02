import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

function calculateMatchScore(call: any, user: any): number {
  let score = 50; // Base score

  // Location match (within same state) +20
  if (user.state && call.location.includes(user.state)) {
    score += 20;
  }

  // Union status match +15
  if (call.unionReq === 'ANY' || user.unionStatus === call.unionReq || call.unionReq === 'EITHER') {
    score += 15;
  }

  // Age range match +15
  if (user.age && call.ageMin && call.ageMax) {
    if (user.age >= call.ageMin && user.age <= call.ageMax) {
      score += 15;
    }
  }

  return Math.min(score, 100);
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get user profile for match scoring
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        state: true,
        unionStatus: true,
        age: true,
        gender: true,
      },
    });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const search = searchParams.get('search') || '';
    const roleType = searchParams.get('roleType') || 'ALL';
    const location = searchParams.get('location') || '';
    const union = searchParams.get('union') || 'ALL';

    const where: any = {
      submissionDeadline: {
        gte: new Date(),
      },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { production: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
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

    const [calls, total, submissions] = await Promise.all([
      prisma.castingCall.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.castingCall.count({ where }),
      prisma.submission.findMany({
        where: { userId },
        select: { callId: true },
      }),
    ]);

    const submittedCallIds = new Set(submissions.map(s => s.callId));

    // Add match scores and auto-submit status
    const callsWithScores = calls.map(call => {
      const matchScore = calculateMatchScore(call, user);
      const wasAutoSubmitted = submittedCallIds.has(call.id) && matchScore >= 85;
      
      return {
        ...call,
        matchScore,
        wasAutoSubmitted,
      };
    });

    return NextResponse.json({
      calls: callsWithScores,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Casting calls error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch casting calls' },
      { status: 500 }
    );
  }
}
