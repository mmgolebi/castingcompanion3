import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    return NextResponse.json(castingCall, { status: 201 });
  } catch (error: any) {
    console.error('Create casting call error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create casting call' },
      { status: 500 }
    );
  }
}
