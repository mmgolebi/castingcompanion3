import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  try {
    const dateFilter = from && to ? {
      createdAt: {
        gte: new Date(from),
        lte: new Date(to + 'T23:59:59.999Z'),
      },
    } : {};

    const users = await prisma.user.findMany({
      where: dateFilter,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        source: true,
      },
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalUsers = users.length;
    const newUsersToday = users.filter(u => new Date(u.createdAt) >= todayStart).length;
    const newUsersThisWeek = users.filter(u => new Date(u.createdAt) >= weekStart).length;
    const newUsersThisMonth = users.filter(u => new Date(u.createdAt) >= monthStart).length;
    const trialUsers = users.filter(u => u.stripeCustomerId && u.subscriptionStatus === 'trialing').length;
    const activeSubscribers = users.filter(u => u.subscriptionStatus === 'active').length;
    const canceledUsers = users.filter(u => u.subscriptionStatus === 'canceled').length;
    const paidUsers = users.filter(u => u.stripeCustomerId).length;
    const conversionRate = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0';

    return NextResponse.json({
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      trialUsers,
      activeSubscribers,
      canceledUsers,
      conversionRate,
      users: users.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
