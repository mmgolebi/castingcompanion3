import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { processCastingCallAutoSubmissions } from '@/lib/autoSubmit';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const castingCalls = await prisma.castingCall.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(castingCalls);
  } catch (error) {
    console.error('Error fetching casting calls:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const castingCall = await prisma.castingCall.create({
      data: body,
    });

    // Process auto-submissions for all matching users
    // Run in background to avoid blocking the response
    processCastingCallAutoSubmissions(castingCall.id).catch(error => {
      console.error('Error processing auto-submissions:', error);
    });

    return NextResponse.json(castingCall);
  } catch (error) {
    console.error('Error creating casting call:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
