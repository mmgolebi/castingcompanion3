// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

function cleanValue(value: any): any {
  if (value === '' || value === undefined) {
    return null;
  }
  return value;
}

function cleanNumber(value: any): number | null {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const num = parseInt(value);
  return isNaN(num) ? null : num;
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch both user and profile data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        Profile: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Combine user and profile data
    const combinedData = {
      name: user.name,
      email: user.email,
      phone: user.Profile?.phone || '',
      age: user.Profile?.age || null,
      playableAgeMin: user.Profile?.playableAgeMin || null,
      playableAgeMax: user.Profile?.playableAgeMax || null,
      gender: user.Profile?.gender || '',
      ethnicity: user.Profile?.ethnicity || '',
      unionStatus: user.Profile?.unionStatus || '',
      height: user.Profile?.height || null,
      weight: user.Profile?.weight || null,
      hairColor: user.Profile?.hairColor || '',
      eyeColor: user.Profile?.eyeColor || '',
      visibleTattoos: user.Profile?.visibleTattoos || false,
      headshot: user.Profile?.headshot || '',
      fullBody: user.Profile?.fullBodyPhoto || '',
      resume: user.Profile?.resume || '',
      city: user.Profile?.city || '',
      state: user.Profile?.state || '',
      zipCode: user.Profile?.zipCode || '',
      availability: user.Profile?.availability || '',
      reliableTransportation: user.Profile?.reliableTransportation || false,
      travelWilling: user.Profile?.travelWilling || false,
      compensationPreference: user.Profile?.compensationPreference || '',
      compensationMin: user.Profile?.compensationMin || '',
      skills: user.Profile?.skills || [],
      roleTypesInterested: user.Profile?.roleTypesInterested || [],
    };
    
    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    console.log('Received profile update data:', data);
    
    const cleanData = {
      userId: session.user.id,
      phone: cleanValue(data.phone),
      age: cleanNumber(data.age),
      playableAgeMin: cleanNumber(data.playableAgeMin),
      playableAgeMax: cleanNumber(data.playableAgeMax),
      gender: cleanValue(data.gender),
      ethnicity: cleanValue(data.ethnicity),
      height: cleanNumber(data.height),
      weight: cleanNumber(data.weight),
      hairColor: cleanValue(data.hairColor),
      eyeColor: cleanValue(data.eyeColor),
      visibleTattoos: Boolean(data.visibleTattoos),
      headshot: cleanValue(data.headshot),
      fullBodyPhoto: cleanValue(data.fullBody),
      resume: cleanValue(data.resume),
      unionStatus: cleanValue(data.unionStatus),
      city: cleanValue(data.city),
      state: cleanValue(data.state),
      zipCode: cleanValue(data.zipCode),
      availability: cleanValue(data.availability),
      reliableTransportation: Boolean(data.reliableTransportation),
      travelWilling: Boolean(data.travelWilling),
      compensationPreference: cleanValue(data.compensationPreference),
      compensationMin: cleanValue(data.compensationMin),
      skills: Array.isArray(data.skills) ? data.skills : [],
      roleTypesInterested: Array.isArray(data.roleTypesInterested) ? data.roleTypesInterested : [],
      profileSlug: cleanValue(data.profileSlug),
      isPublic: Boolean(data.isPublic),
      updatedAt: new Date(),
    };
    
    console.log('Cleaned data for Prisma:', cleanData);
    
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: cleanData,
      create: {
        ...cleanData,
        id: `profile_${session.user.id}_${Date.now()}`,
      },
    });
    
    console.log('Profile saved successfully:', profile.id);
    
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    if (profile.profileSlug) {
      revalidatePath(`/actors/${profile.profileSlug}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      profile 
    });
    
  } catch (error: any) {
    console.error('Profile update error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
