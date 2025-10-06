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
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const combinedData = {
      name: user.name,
      email: user.email,
      phone: user.profile?.phone || '',
      age: user.profile?.age || null,
      playableAgeMin: user.profile?.playableAgeMin || null,
      playableAgeMax: user.profile?.playableAgeMax || null,
      gender: user.profile?.gender || '',
      ethnicity: user.profile?.ethnicity || '',
      unionStatus: user.profile?.unionStatus || '',
      height: user.profile?.height || null,
      weight: user.profile?.weight || null,
      hairColor: user.profile?.hairColor || '',
      eyeColor: user.profile?.eyeColor || '',
      visibleTattoos: user.profile?.visibleTattoos || false,
      headshot: user.profile?.headshot || '',
      fullBody: user.profile?.fullBodyPhoto || '',
      resume: user.profile?.resume || '',
      city: user.profile?.city || '',
      state: user.profile?.state || '',
      zipCode: user.profile?.zipCode || '',
      availability: user.profile?.availability || '',
      reliableTransportation: user.profile?.reliableTransportation || false,
      travelWilling: user.profile?.travelWilling || false,
      compensationPreference: user.profile?.compensationPreference || '',
      compensationMin: user.profile?.compensationMin || '',
      skills: user.profile?.skills || [],
      roleTypesInterested: user.profile?.roleTypesInterested || [],
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
    
    // Profile data (everything except name)
    const profileData = {
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
    
    console.log('Cleaned profile data for Prisma:', profileData);
    
    // Use a transaction to update both User and Profile
    const [user, profile] = await prisma.$transaction([
      // Update User name
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: cleanValue(data.name),
          updatedAt: new Date(),
        },
      }),
      // Upsert Profile
      prisma.profile.upsert({
        where: { userId: session.user.id },
        update: profileData,
        create: {
          ...profileData,
          id: `profile_${session.user.id}_${Date.now()}`,
        },
      }),
    ]);
    
    console.log('Profile saved successfully:', profile.id);
    
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    if (profile.profileSlug) {
      revalidatePath(`/actors/${profile.profileSlug}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      user,
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
