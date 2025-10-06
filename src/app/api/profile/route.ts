import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Flatten user and profile data
    const profileData = {
      email: user.email,
      name: user.name,
      ...user.profile,
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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

    // Update user name if provided
    if (data.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: data.name },
      });
    }

    // Prepare profile data (exclude user fields)
    const profileData: any = {};
    const profileFields = [
      'phone', 'age', 'playableAgeMin', 'playableAgeMax', 'gender', 'ethnicity',
      'height', 'weight', 'hairColor', 'eyeColor', 'visibleTattoos',
      'headshot', 'fullBodyPhoto', 'resume', 'unionStatus',
      'city', 'state', 'zipCode', 'availability', 'reliableTransportation',
      'travelWilling', 'compensationPreference', 'compensationMin',
      'skills', 'roleTypesInterested'
    ];

    profileFields.forEach(field => {
      if (data[field] !== undefined) {
        profileData[field] = data[field];
      }
    });

    // Update or create profile
    if (user.profile) {
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: profileData,
      });
    } else {
      await prisma.profile.create({
        data: {
          userId: user.id,
          ...profileData,
        },
      });
    }

    // Fetch updated user with profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    return NextResponse.json({
      email: updatedUser?.email,
      name: updatedUser?.name,
      ...updatedUser?.profile,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return PATCH(req);
}
