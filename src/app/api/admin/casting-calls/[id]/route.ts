import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    return { authorized: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { authorized: true };
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.authorized) return adminCheck.response;

    const call = await prisma.castingCall.findUnique({
      where: { id: params.id },
    });

    if (!call) {
      return NextResponse.json({ error: 'Casting call not found' }, { status: 404 });
    }

    return NextResponse.json(call);
  } catch (error: any) {
    console.error('Get casting call error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch casting call' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.authorized) return adminCheck.response;

    const data = await req.json();

    const castingCall = await prisma.castingCall.update({
      where: { id: params.id },
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
        shootDates: data.shootDates,
        castingEmail: data.castingEmail,
        submissionDeadline: new Date(data.submissionDeadline),
      },
    });

    return NextResponse.json(castingCall);
  } catch (error: any) {
    console.error('Update casting call error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update casting call' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await checkAdmin();
    if (!adminCheck.authorized) return adminCheck.response;

    await prisma.castingCall.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete casting call error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete casting call' },
      { status: 500 }
    );
  }
}
