import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assertAdmin, assertAuthenticated } from '@/lib/rbac';
import { z } from 'zod';

const updateCallSchema = z.object({
  title: z.string().min(1).optional(),
  production: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  roleType: z.enum(['LEAD', 'SUPPORTING', 'BACKGROUND', 'EXTRA', 'COMMERCIAL']).optional(),
  genderReq: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'ANY']).optional(),
  ageMin: z.number().int().optional(),
  ageMax: z.number().int().optional(),
  ethnicityReq: z.enum(['ANY', 'ASIAN', 'BLACK', 'HISPANIC', 'MIDDLE_EASTERN', 'NATIVE_AMERICAN', 'PACIFIC_ISLANDER', 'WHITE', 'OTHER']).optional(),
  location: z.string().min(1).optional(),
  compensation: z.string().min(1).optional(),
  unionReq: z.enum(['ANY', 'SAG_AFTRA', 'NON_UNION', 'EITHER']).optional(),
  skillsRequired: z.array(z.string()).optional(),
  shootDates: z.string().optional(),
  castingEmail: z.string().email().optional(),
  submissionDeadline: z.string().datetime().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    assertAuthenticated(session);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;

    const call = await prisma.castingCall.findUnique({
      where: { id },
      include: {
        submissions: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!call) {
      return NextResponse.json(
        { error: 'Casting call not found' },
        { status: 404 }
      );
    }

    // Calculate match score
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    let matchScore = 0;
    if (profile) {
      if (profile.age && call.ageMin && call.ageMax) {
        matchScore += profile.age >= call.ageMin && profile.age <= call.ageMax ? 30 : 0;
      } else {
        matchScore += 15;
      }
      if (call.genderReq === 'ANY' || profile.gender === call.genderReq) matchScore += 25;
      if (call.unionReq === 'ANY' || call.unionReq === 'EITHER' || profile.unionStatus === call.unionReq) matchScore += 20;
      if (call.ethnicityReq === 'ANY' || profile.ethnicity === call.ethnicityReq) matchScore += 15;
      if (profile.roleInterests?.includes(call.roleType)) matchScore += 10;
    }

    return NextResponse.json({
      call: { ...call, matchScore },
      hasSubmitted: call.submissions.length > 0,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Get casting call error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch casting call' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    assertAdmin(session);
    
    const { id } = await params;

    const body = await req.json();
    const data = updateCallSchema.parse(body);

    const updateData: any = { ...data };
    if (data.submissionDeadline) {
      updateData.submissionDeadline = new Date(data.submissionDeadline);
    }

    const call = await prisma.castingCall.update({
      where: { id },
      data: updateData,
    });

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

    console.error('Update casting call error:', error);
    return NextResponse.json(
      { error: 'Failed to update casting call' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    assertAdmin(session);
    
    const { id } = await params;

    await prisma.castingCall.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.error('Delete casting call error:', error);
    return NextResponse.json(
      { error: 'Failed to delete casting call' },
      { status: 500 }
    );
  }
}