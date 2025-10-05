import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const data = await req.json();

    // Update user profile with all fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        age: data.age,
        playableAgeMin: data.playableAgeMin,
        playableAgeMax: data.playableAgeMax,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        ethnicity: data.ethnicity,
        hairColor: data.hairColor,
        eyeColor: data.eyeColor,
        visibleTattoos: data.visibleTattoos,
        headshot: data.headshot,
        fullBody: data.fullBody,
        resume: data.resume,
        demoReel: data.demoReel,
        unionStatus: data.unionStatus,
        skills: data.skills || [],
        roleTypesInterested: data.roleTypesInterested || [],
        comfortLevels: data.comfortLevels || [],
        availability: data.availability,
        reliableTransportation: data.reliableTransportation,
        travelWilling: data.travelWilling,
        compensationPreference: data.compensationPreference,
        compensationMin: data.compensationMin,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const data = await req.json();

    // Update user profile with all fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        age: data.age,
        playableAgeMin: data.playableAgeMin,
        playableAgeMax: data.playableAgeMax,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        ethnicity: data.ethnicity,
        hairColor: data.hairColor,
        eyeColor: data.eyeColor,
        visibleTattoos: data.visibleTattoos,
        headshot: data.headshot,
        fullBody: data.fullBody,
        resume: data.resume,
        demoReel: data.demoReel,
        unionStatus: data.unionStatus,
        skills: data.skills || [],
        roleTypesInterested: data.roleTypesInterested || [],
        comfortLevels: data.comfortLevels || [],
        availability: data.availability,
        reliableTransportation: data.reliableTransportation,
        travelWilling: data.travelWilling,
        compensationPreference: data.compensationPreference,
        compensationMin: data.compensationMin,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
