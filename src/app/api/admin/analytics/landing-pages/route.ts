import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || '2025-10-28';
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

    const fromDate = new Date(from + 'T00:00:00Z');
    const toDate = new Date(to + 'T23:59:59Z');

    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        role: 'ACTOR',
      },
      select: {
        source: true,
        subscriptionStatus: true,
      },
    });

    const sourceMap: Record<string, { registrations: number; trials: number; paid: number }> = {};

    for (const user of users) {
      const source = user.source || 'direct';
      if (!sourceMap[source]) {
        sourceMap[source] = { registrations: 0, trials: 0, paid: 0 };
      }
      sourceMap[source].registrations++;
      const status = user.subscriptionStatus?.toLowerCase();
      if (status === 'trialing' || status === 'trial' || status === 'active') {
        sourceMap[source].trials++;
      }
      if (status === 'active') {
        sourceMap[source].paid++;
      }
    }

    const data = Object.entries(sourceMap).map(([source, stats]) => ({
      source,
      registrations: stats.registrations,
      trials: stats.trials,
      paid: stats.paid,
      trialRate: stats.registrations > 0 ? ((stats.trials / stats.registrations) * 100).toFixed(1) + '%' : '0%',
      paidRate: stats.registrations > 0 ? ((stats.paid / stats.registrations) * 100).toFixed(1) + '%' : '0%',
    }));

    data.sort((a, b) => b.registrations - a.registrations);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Landing page analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
