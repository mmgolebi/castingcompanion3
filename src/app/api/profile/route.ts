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
    
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });
    
    return NextResponse.json(profile);
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
    
    // Clean all data - convert empty strings to null
    const cleanData = {
      userId: session.user.id,
      
      // Contact
      phone: cleanValue(data.phone),
      
      // Basic info
      age: cleanNumber(data.age),
      playableAgeMin: cleanNumber(data.playableAgeMin),
      playableAgeMax: cleanNumber(data.playableAgeMax),
      gender: cleanValue(data.gender),
      ethnicity: cleanValue(data.ethnicity),
      
      // Physical
      height: cleanNumber(data.height),
      weight: cleanNumber(data.weight),
      hairColor: cleanValue(data.hairColor),
      eyeColor: cleanValue(data.eyeColor),
      visibleTattoos: Boolean(data.visibleTattoos),
      
      // Media
      headshot: cleanValue(data.headshot),
      fullBodyPhoto: cleanValue(data.fullBodyPhoto),
      resume: cleanValue(data.resume),
      
      // Professional
      unionStatus: cleanValue(data.unionStatus),
      
      // Location
      city: cleanValue(data.city),
      state: cleanValue(data.state),
      zipCode: cleanValue(data.zipCode),
      
      // Availability
      availability: cleanValue(data.availability),
      reliableTransportation: Boolean(data.reliableTransportation),
      travelWilling: Boolean(data.travelWilling),
      
      // Compensation
      compensationPreference: cleanValue(data.compensationPreference),
      compensationMin: cleanValue(data.compensationMin),
      
      // Arrays
      skills: Array.isArray(data.skills) ? data.skills : [],
      roleTypesInterested: Array.isArray(data.roleTypesInterested) ? data.roleTypesInterested : [],
      
      // Public profile
      profileSlug: cleanValue(data.profileSlug),
      isPublic: Boolean(data.isPublic),
      
      // Timestamp
      updatedAt: new Date(),
    };
    
    console.log('Cleaned data for Prisma:', cleanData);
    
    // Upsert - create if doesn't exist, update if it does
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: cleanData,
      create: {
        ...cleanData,
        id: `profile_${session.user.id}_${Date.now()}`,
      },
    });
    
    console.log('Profile saved successfully:', profile.id);
    
    // Revalidate cache
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
      stack: error.stack
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
