import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user?.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    await prisma.profile.update({
      where: { id: user.profile.id },
      data: {
        skills: data.skills || [],
        roleTypesInterested: data.roleTypesInterested || [],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving step 3:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
