import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email, status } = await req.json();

  if (!email || !status) {
    return NextResponse.json({ error: 'Missing email or status' }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { email },
      data: { subscriptionStatus: status },
    });

    return NextResponse.json({
      success: true,
      email: updated.email,
      newStatus: updated.subscriptionStatus,
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to update',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
