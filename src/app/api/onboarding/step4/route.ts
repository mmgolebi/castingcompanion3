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
    const data = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: data.phone,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Step 4 error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save step 4' },
      { status: 500 }
    );
  }
}
