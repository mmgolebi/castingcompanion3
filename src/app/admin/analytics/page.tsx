import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AnalyticsDashboard from './AnalyticsDashboard';
import AnalyticsTabWrapper from './AnalyticsTabWrapper';

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  // Check if admin
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (currentUser?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;

  // Date filtering - default to 2025-10-28 onwards
  const fromDate = params.from 
    ? new Date(params.from + 'T00:00:00Z') 
    : new Date('2025-10-28T00:00:00Z');
  
  const toDate = params.to 
    ? new Date(params.to + 'T23:59:59Z') 
    : new Date();

  // Fetch all users in date range
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      role: 'ACTOR', // Only count actors, not admins
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate metrics
  const totalRegistrations = users.length;
  const trials = users.filter(u => 
    u.subscriptionStatus === 'trialing' || 
    u.subscriptionStatus === 'TRIAL' ||
    u.subscriptionStatus === 'trial'
  ).length;
  const activeSubscriptions = users.filter(u => 
    u.subscriptionStatus === 'active' || 
    u.subscriptionStatus === 'ACTIVE'
  ).length;
  const inactive = users.filter(u => 
    u.subscriptionStatus === 'inactive' || 
    u.subscriptionStatus === 'INACTIVE' ||
    !u.subscriptionStatus
  ).length;
  const canceled = users.filter(u => 
    u.subscriptionStatus === 'canceled' || 
    u.subscriptionStatus === 'CANCELED' ||
    u.subscriptionStatus === 'cancelled'
  ).length;

  // Conversion rates
  const trialConversionRate = totalRegistrations > 0 
    ? ((trials + activeSubscriptions) / totalRegistrations * 100).toFixed(1)
    : '0';
  const paidConversionRate = totalRegistrations > 0
    ? (activeSubscriptions / totalRegistrations * 100).toFixed(1)
    : '0';

  // Group by day for chart
  const dailyData: Record<string, { date: string; registrations: number; trials: number; active: number }> = {};
  
  users.forEach(user => {
    const dateKey = user.createdAt.toISOString().split('T')[0];
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { date: dateKey, registrations: 0, trials: 0, active: 0 };
    }
    dailyData[dateKey].registrations++;
    if (user.subscriptionStatus === 'trialing' || user.subscriptionStatus === 'TRIAL' || user.subscriptionStatus === 'trial') {
      dailyData[dateKey].trials++;
    }
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'ACTIVE') {
      dailyData[dateKey].active++;
    }
  });

  const chartData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AnalyticsTabWrapper><AnalyticsDashboard
      fromDate={fromDate.toISOString().split('T')[0]}
      toDate={toDate.toISOString().split('T')[0]}
      metrics={{
        totalRegistrations,
        trials,
        activeSubscriptions,
        inactive,
        canceled,
        trialConversionRate,
        paidConversionRate,
      }}
      users={users.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
      chartData={chartData}
    />
  );
}
