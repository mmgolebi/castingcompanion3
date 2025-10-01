import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assertAdmin, assertAuthenticated } from '@/lib/rbac';
import { z } from 'zod';

const createCallSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  production: z.string().min(1, 'Production name is required'),
  description: z.string().min(1, 'Description is required'),
  roleType: z.enum(['LEAD', 'SUPPORTING', 'BACKGROUND', 'EXTRA', 'COMMERCIAL']),
  genderReq: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'ANY']).default('ANY'),
  ageMin: z.number().int().optional(),
  ageMax: z.number().int().optional(),
  ethnicityReq: z.enum(['ANY', 'ASIAN', 'BLACK', 'HISPANIC', 'MIDDLE_EASTERN', 'NATIVE_AMERICAN', 'PACIFIC_ISLANDER', 'WHITE', 'OTHER']).default('ANY'),
  location: z.string().min(1, 'Location is required'),
  compensation: z.string().min(1, 'Compensation is required'),
  unionReq: z.enum(['ANY', 'SAG_AFTRA', 'NON_UNION', 'EITHER']).default('ANY'),
  skillsRequired: z.array(z.string()).default([]),
  shootDates: z.string().optional(),
  castingEmail: z.string().email('Valid email required'),
  submissionDeadline: z.string().datetime(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    assertAuthenticated(session);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const q = searchParams.get('q') || '';
    const roleType = searchParams.get('roleType');
    const location = searchParams.get('location');
    const unionReq = searchParams.get('unionReq');
    const sort = searchParams.get('sort') || 'deadline';

    const skip = (page - 1) * pageSize;

    const where: any = {
      submissionDeadline: { gte: new Date() },
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { production: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (roleType) where.roleType = roleType;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (unionReq) where.unionReq = unionReq;

    const orderBy: any = sort === 'deadline' 
      ? { submissionDeadline: 'asc' }
      : { createdAt: 'desc' };

    const [calls, total] = await Promise.all([
      prisma.castingCall.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.castingCall.count({ where }),
    ]);

    // Get user profile for match calculation
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    // Calculate match scores
    const callsWithScores = calls.map(call => {
      let matchScore = 0;
      
      if (profile) {
        // Age (30 pts)
        if (profile.age && call.ageMin && call.ageMax) {
          matchScore += profile.age >= call.ageMin && profile.age <= call.ageMax ? 30 : 0;
        } else {
          matchScore += 15;
        }
        
        // Gender (25 pts)
        if (call.genderReq === 'ANY' || profile.gender === call.genderReq) {
          matchScore += 25;
        }
        
        // Union (20 pts)
        if (call.unionReq === 'ANY' || call.unionReq === 'EITHER') {
          matchScore += 20;
        } else if (profile.unionStatus === call.unionReq) {
          matchScore += 20;
        }
        
        // Ethnicity (15 pts)
        if (call.ethnicityReq === 'ANY' || profile.ethnicity === call.ethnicityReq) {
          matchScore += 15;
        }
        
        // Role interest (10 pts)
        if (profile.roleInterests?.includes(call.roleType)) {
          matchScore += 10;
        }
      }

      return { ...call, matchScore };
    });

    return NextResponse.json({
      calls: callsWithScores,
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

    console.error('Get casting calls error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch casting calls' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    assertAdmin(session);

    const body = await req.json();
    const data = createCallSchema.parse(body);

    const call = await prisma.castingCall.create({
      data: {
        ...data,
        submissionDeadline: new Date(data.submissionDeadline),
        createdById: session.user.id,
      },
    });

    // Trigger match recalculation for all users
    // This would be done via a background job in production

    return NextResponse.json({ success: true, call });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create casting call error:', error);
    return NextResponse.json(
      { error: 'Failed to create casting call' },
      { status: 500 }
    );
  }
}
