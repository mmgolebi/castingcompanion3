import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createOrUpdateGHLContact } from '@/lib/ghl';
import { trackRegistration, trackGHLSync } from '@/lib/metrics';

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { name, email, password } = await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      trackRegistration(false, 'User already exists');
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log('User created:', user.id, user.email);

    // Track successful registration
    trackRegistration(true);

    // Send to GoHighLevel (non-blocking)
    createOrUpdateGHLContact({
      email: user.email,
      firstName: user.name || '',
      tags: ['registered', 'euphoria-applicant'],
      customFields: {
        'user_id': user.id,
        'signup_date': new Date().toISOString(),
        'source': 'casting-companion'
      }
    })
      .then(() => {
        trackGHLSync('registration', true, user.email);
      })
      .catch(error => {
        console.error('GHL sync failed (non-blocking):', error);
        trackGHLSync('registration', false, user.email, error.message);
      });

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    trackRegistration(false, error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
