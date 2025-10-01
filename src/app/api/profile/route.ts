import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assertAuthenticated } from '@/lib/rbac';
import { z } from 'zod';

const profileSchema = z.object({
  phone: z.string().optional(),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  locationZip: z.string().optional(),
  age: z.number().int().min(13).max(99).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'ANY']).optional(),
  ethnicity: z.enum(['ANY', 'ASIAN', 'BLACK', 'HISPANIC', 'MIDDLE_EASTERN', 'NATIVE_AMERICAN', 'PACIFIC_ISLANDER', 'WHITE', 'OTHER']).optional(),
  unionStatus: z.enum(['ANY', 'SAG_AFTRA', 'NON_UNION', 'EITHER']).optional(),
  playableAgeMin: z.number().int().optional(),
  playableAgeMax: z.number().int().optional(),
  agency: z.string().optional(),
  headshotUrl: z.string().url().optional(),
  fullBodyUrl: z.string().url().optional(),
  resumeUrl: z.string().url().optional(),
  reelLink: z.string().url().optional(),
  instagram: z.string().url().optional(),
  tiktok: z.string().url().optional(),
  youtube: z.string().url().optional(),
  roleInterests: z.array(z.enum(['LEAD', 'SUPPORTING', 'BACKGROUND', 'EXTRA', 'COMMERCIAL'])).optional(),
  specialSkills: z.array(z.string()).optional(),
  comfortLevels: z.array(z.string()).optional(),
  availability: z.string().optional(),
  transportation: z.boolean().optional(),
  compPrefs: z.string().optional(),
  travelWillingness: z.boolean().optional(),
  heightCm: z.number().int().optional(),
  weightKg: z.number().int().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  visibleTattoos: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    assertAuthenticated(session);

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    assertAuthenticated(session);

    const body = await req.json();
    const data = profileSchema.parse(body);

    // Upsert profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        ...data,
      },
    });

    // Trigger match recalculation
    // This would be done via a background job in production
    // For now, we'll just return success

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
