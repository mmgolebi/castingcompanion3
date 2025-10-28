import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createOrUpdateGHLContact } from '@/lib/ghl';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Update user name
    await prisma.user.update({
      where: { email: session.user.email },
      data: { name: data.name },
    });

    // Find or create profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.profile) {
      // Update existing profile
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          phone: data.phone,
          age: data.age,
          playableAgeMin: data.playableAgeMin,
          playableAgeMax: data.playableAgeMax,
          gender: data.gender,
          ethnicity: data.ethnicity,
          unionStatus: data.unionStatus,
          height: data.height,
          weight: data.weight,
          hairColor: data.hairColor,
          eyeColor: data.eyeColor,
          visibleTattoos: data.visibleTattoos,
          bio: data.bio,
        },
      });
    } else {
      // Create new profile
      await prisma.profile.create({
        data: {
          userId: user.id,
          phone: data.phone,
          age: data.age,
          playableAgeMin: data.playableAgeMin,
          playableAgeMax: data.playableAgeMax,
          gender: data.gender,
          ethnicity: data.ethnicity,
          unionStatus: data.unionStatus,
          height: data.height,
          weight: data.weight,
          hairColor: data.hairColor,
          eyeColor: data.eyeColor,
          visibleTattoos: data.visibleTattoos,
          bio: data.bio,
        },
      });
    }

    // Sync phone number to GHL (non-blocking)
    if (data.phone) {
      createOrUpdateGHLContact({
        email: user.email,
        firstName: user.name || '',
        phone: data.phone,
        tags: ['registered', 'euphoria-applicant', 'step1-complete'],
        customFields: {
          user_id: user.id,
        }
      }).catch(error => {
        console.error('GHL sync failed (non-blocking):', error);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in step 1:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
