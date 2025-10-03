import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
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

    const castingCall = await prisma.castingCall.update({
      where: { id },
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

    return NextResponse.json(castingCall);
  } catch (error) {
    console.error('Error updating casting call:', error);
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
    const resolvedParams = await params;
    const id = resolvedParams.id;
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

    await prisma.castingCall.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting casting call:', error);
    return NextResponse.json(
      { error: 'Failed to delete casting call' },
      { status: 500 }
    );
  }
}
