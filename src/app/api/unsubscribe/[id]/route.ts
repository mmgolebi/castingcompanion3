import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id;

    // Mark submission as unsubscribed or delete it
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'UNSUBSCRIBED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
