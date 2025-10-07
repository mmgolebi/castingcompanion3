import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { processUserAutoSubmissions } from '@/lib/autoSubmit';

async function handleAutoSubmit() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await processUserAutoSubmissions(user.id);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error with auto-submission:', error);
    return NextResponse.json({ error: 'Failed to auto-submit' }, { status: 500 });
  }
}

export async function GET() {
  return handleAutoSubmit();
}

export async function POST() {
  return handleAutoSubmit();
}
