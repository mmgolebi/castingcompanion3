import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ 
        error: 'Title is required' 
      }, { status: 400 });
    }

    let ageMin: number | undefined;
    let ageMax: number | undefined;
    if (body.ageRange) {
      const ageMatch = body.ageRange.match(/(\d+)\s*[-–to]+\s*(\d+)/);
      if (ageMatch) {
        ageMin = parseInt(ageMatch[1]);
        ageMax = parseInt(ageMatch[2]);
      }
    }

    let gender = 'ANY';
    if (body.gender) {
      const g = body.gender.toUpperCase();
      if (g.includes('MALE') && !g.includes('FEMALE')) gender = 'MALE';
      else if (g.includes('FEMALE')) gender = 'FEMALE';
      else if (g.includes('NON') || g.includes('BINARY')) gender = 'NON_BINARY';
      else gender = 'ANY';
    }

    let unionStatus = 'EITHER';
    if (body.unionStatus) {
      const u = body.unionStatus.toUpperCase();
      if (u.includes('SAG') || u.includes('AFTRA') || u.includes('UNION')) {
        if (u.includes('NON')) unionStatus = 'NON_UNION';
        else unionStatus = 'SAG_AFTRA';
      }
    }

    let locationCity = '';
    let locationState = '';
    if (body.location) {
      const parts = body.location.split(',').map((p: string) => p.trim());
      if (parts.length >= 2) {
        locationCity = parts[0];
        locationState = parts[1];
      } else {
        locationCity = body.location;
      }
    }

    let roleType = 'DAY_PLAYER';
    if (body.roleType) {
      const r = body.roleType.toUpperCase().replace(/[^A-Z]/g, '_');
      const validTypes = ['LEAD', 'SUPPORTING', 'DAY_PLAYER', 'RECURRING', 'GUEST_STAR', 'CO_STAR', 'BACKGROUND', 'VOICE_OVER'];
      if (validTypes.includes(r)) {
        roleType = r;
      } else if (body.roleType.toLowerCase().includes('lead')) {
        roleType = 'LEAD';
      } else if (body.roleType.toLowerCase().includes('support')) {
        roleType = 'SUPPORTING';
      } else if (body.roleType.toLowerCase().includes('extra') || body.roleType.toLowerCase().includes('background')) {
        roleType = 'BACKGROUND';
      }
    }

    let deadline: Date | undefined;
    if (body.deadline) {
      const parsed = new Date(body.deadline);
      if (!isNaN(parsed.getTime())) {
        deadline = parsed;
      }
    }

    const castingCall = await prisma.castingCall.create({
      data: {
        title: body.title,
        production: body.production || null,
        roleType,
        description: body.description || '',
        gender,
        ageRangeMin: ageMin || null,
        ageRangeMax: ageMax || null,
        ethnicity: body.ethnicity || 'ANY',
        location: body.location || "",
        // locationState removed
        compensation: body.compensation || null,
        unionStatus,
        castingDirector: body.castingDirector || null,
        castingEmail: body.castingDirectorEmail || null,
        deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sourceUrl: body.sourceUrl || null,
        status: 'ACTIVE',
        createdById: currentUser.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      castingCall: {
        id: castingCall.id,
        title: castingCall.title,
      }
    });

  } catch (error) {
    console.error('Import casting call error:', error);
    return NextResponse.json({ 
      error: 'Failed to save casting call',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
