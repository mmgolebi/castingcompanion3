import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { addGHLTag } from '@/lib/ghl';

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
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        availability: data.availability,
        reliableTransportation: data.reliableTransportation,
        travelWilling: data.travelWilling,
        compensationPreference: data.compensationPreference,
        compensationMin: data.compensationMin,
      },
    });

    // Add GHL tag (non-blocking)
    addGHLTag(session.user.email, 'step4-complete').catch(error => {
      console.error('GHL tag failed (non-blocking):', error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving step 4:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
