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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user name
    await prisma.user.update({
      where: { id: user.id },
      data: { name: data.name },
    });

    // Update or create profile
    if (user.profile) {
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          phone: data.phone,
          age: data.age,
          playableAgeMin: data.playableAgeMin,
          playableAgeMax: data.playableAgeMax,
          gender: data.gender,
          ethnicity: data.ethnicity,
          hairColor: data.hairColor,
          eyeColor: data.eyeColor,
          height: data.height,
          weight: data.weight,
          visibleTattoos: data.visibleTattoos,
          unionStatus: data.unionStatus,
        },
      });
    } else {
      await prisma.profile.create({
        data: {
          userId: user.id,
          phone: data.phone,
          age: data.age,
          playableAgeMin: data.playableAgeMin,
          playableAgeMax: data.playableAgeMax,
          gender: data.gender,
          ethnicity: data.ethnicity,
          hairColor: data.hairColor,
          eyeColor: data.eyeColor,
          height: data.height,
          weight: data.weight,
          visibleTattoos: data.visibleTattoos,
          unionStatus: data.unionStatus,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving step 1:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
