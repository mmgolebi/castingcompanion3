import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
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

    const castingCall = await prisma.castingCall.findUnique({
      where: { id },
    });

    if (!castingCall) {
      return NextResponse.json({ error: 'Casting call not found' }, { status: 404 });
    }

    return NextResponse.json(castingCall);
  } catch (error: any) {
    console.error('Get casting call error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch casting call' },
      { status: 500 }
    );
  }
}
