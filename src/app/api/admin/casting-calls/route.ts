import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
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

    const castingCalls = await prisma.castingCall.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(castingCalls);
  } catch (error) {
    console.error('Error fetching casting calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch casting calls' },
      { status: 500 }
    );
  }
}

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
        location: data.location,
        compensation: data.compensation,
        submissionDeadline: new Date(data.submissionDeadline),
        shootingDates: data.shootingDates,
        ageRangeMin: data.ageRangeMin,
        ageRangeMax: data.ageRangeMax,
        gender: data.gender,
        ethnicity: data.ethnicity,
        unionStatus: data.unionStatus,
        castingEmail: data.castingEmail,
        featuredImage: data.featuredImage || null,
      },
    });

    return NextResponse.json(castingCall, { status: 201 });
  } catch (error) {
    console.error('Error creating casting call:', error);
    return NextResponse.json(
      { error: 'Failed to create casting call' },
      { status: 500 }
    );
  }
}
