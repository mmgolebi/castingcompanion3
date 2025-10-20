import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createOrUpdateGHLContact } from '@/lib/ghl';

export async function POST(req: Request) {
  try {
    console.log('Step 1: Starting');
    
    const session = await auth();
    console.log('Step 1: Session user email:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('Step 1: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    console.log('Step 1: Received data:', JSON.stringify(data));

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });
    
    console.log('Step 1: Found user:', user?.id, 'Has profile:', !!user?.profile);

    if (!user) {
      console.log('Step 1: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user name
    console.log('Step 1: Updating user name to:', data.name);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: data.name },
    });
    console.log('Step 1: User updated, new name:', updatedUser.name);

    // Update or create profile
    if (user.profile) {
      console.log('Step 1: Updating existing profile:', user.profile.id);
      const updatedProfile = await prisma.profile.update({
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
      console.log('Step 1: Profile updated:', updatedProfile.id);
    } else {
      console.log('Step 1: Creating new profile');
      const newProfile = await prisma.profile.create({
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
      console.log('Step 1: Profile created:', newProfile.id);
    }

    // Update GHL contact with phone number (non-blocking)
    if (data.phone) {
      createOrUpdateGHLContact({
        email: session.user.email,
        firstName: data.name || updatedUser.name || '',
        phone: data.phone,
      }).catch(error => {
        console.error('GHL phone update failed (non-blocking):', error);
      });
    }

    console.log('Step 1: Success!');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Step 1: ERROR:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
