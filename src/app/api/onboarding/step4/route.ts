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
        availability: data.availability,
        reliableTransportation: data.reliableTransportation || false,
        travelWilling: data.travelWilling || false,
        compensationPreference: data.compensationPreference,
        height: data.height,
        weight: data.weight ? parseInt(data.weight) : null,
        hairColor: data.hairColor,
        eyeColor: data.eyeColor,
        visibleTattoos: data.visibleTattoos || false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding step 4 error:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
