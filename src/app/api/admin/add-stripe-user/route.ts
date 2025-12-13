import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email, stripeCustomerId, status } = await req.json();

  if (!email || !stripeCustomerId) {
    return NextResponse.json({ error: 'Missing email or stripeCustomerId' }, { status: 400 });
  }

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    
    if (existing) {
      // Update existing user with Stripe info
      const updated = await prisma.user.update({
        where: { email },
        data: { 
          stripeCustomerId,
          subscriptionStatus: status || 'active',
        },
      });
      return NextResponse.json({
        success: true,
        action: 'updated',
        user: { email: updated.email, stripeCustomerId: updated.stripeCustomerId, status: updated.subscriptionStatus },
      });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        stripeCustomerId,
        subscriptionStatus: status || 'active',
        role: 'ACTOR',
      },
    });

    return NextResponse.json({
      success: true,
      action: 'created',
      user: { email: newUser.email, stripeCustomerId: newUser.stripeCustomerId, status: newUser.subscriptionStatus },
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
