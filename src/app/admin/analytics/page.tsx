import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AnalyticsDashboard from './AnalyticsDashboard';
import AnalyticsTabWrapper from './AnalyticsTabWrapper';
import { getStripePaymentHistory } from '@/lib/stripe-analytics';

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (currentUser?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const params = await searchParams;

  const fromDate = params.from 
    ? new Date(params.from + 'T00:00:00Z') 
    : new Date('2025-10-28T00:00:00Z');
  
  const toDate = params.to 
    ? new Date(params.to + 'T23:59:59Z') 
    : new Date();

  // Fetch Stripe payment history for accurate rebill tracking
  const stripePayments = await getStripePaymentHistory();

  // Fetch all users in date range with source
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      role: 'ACTOR',
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
      source: true,
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
  const canceled = users.filter(u => 
    u.subscriptionStatus === 'canceled' || 
    u.subscriptionStatus === 'CANCELED' ||
    u.subscriptionStatus === 'cancelled'
  ).length;
  const inactive = users.filter(u => 
    !u.subscriptionStatus || 
    u.subscriptionStatus === 'inactive' || 
    u.subscriptionStatus === 'INACTIVE'
  ).length;

  // Users who started a trial (have stripeCustomerId)
  const startedTrial = users.filter(u => u.stripeCustomerId).length;
  
  // *** ACCURATE: Users who actually paid $39.97 (verified from Stripe invoices) ***
  const paidEver = users.filter(u => {
    if (!u.stripeCustomerId) return false;
    const stripeData = stripePayments.get(u.stripeCustomerId);
    return stripeData?.hasPaidFullPrice === true;
  }).length;

  // Trials that have ended (started more than 14 days ago)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  const trialsEnded = users.filter(u => 
    u.stripeCustomerId && 
    new Date(u.createdAt) < fourteenDaysAgo
  ).length;
  
  const trialsStillActive = users.filter(u =>
    u.stripeCustomerId &&
    (u.subscriptionStatus === 'trialing' || u.subscriptionStatus === 'trial') &&
    new Date(u.createdAt) >= fourteenDaysAgo
  ).length;

  // Rebill success rate (of trials that ended, how many ACTUALLY paid $39.97)
  const rebillSuccessRate = trialsEnded > 0 
    ? ((paidEver / trialsEnded) * 100).toFixed(1)
    : '0';

  // Trial cancellation (canceled and never paid $39.97)
  const canceledDuringTrial = users.filter(u => {
    if (!u.stripeCustomerId) return false;
    const stripeData = stripePayments.get(u.stripeCustomerId);
    const neverPaidFull = !stripeData?.hasPaidFullPrice;
    const isCanceled = u.subscriptionStatus === 'canceled' || u.subscriptionStatus === 'cancelled';
    return neverPaidFull && isCanceled;
  }).length;

  // Customer churn (paid $39.97 but no longer active)
  const churned = users.filter(u => {
    if (!u.stripeCustomerId) return false;
    const stripeData = stripePayments.get(u.stripeCustomerId);
    const hasPaidFull = stripeData?.hasPaidFullPrice === true;
    const isNotActive = u.subscriptionStatus !== 'active' && u.subscriptionStatus !== 'ACTIVE';
    return hasPaidFull && isNotActive;
  }).length;
  
  const churnRate = paidEver > 0 
    ? ((churned / paidEver) * 100).toFixed(1)
    : '0';

  // Conversion rates
  const trialConversionRate = totalRegistrations > 0 
    ? ((startedTrial / totalRegistrations) * 100).toFixed(1)
    : '0';
  const paidConversionRate = totalRegistrations > 0
    ? (activeSubscriptions / totalRegistrations * 100).toFixed(1)
    : '0';

  // Days in range for daily avg
  const daysDiff = Math.max(1, Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyAvg = (totalRegistrations / daysDiff).toFixed(1);

  // Landing page performance - now with accurate paid data from Stripe
  const sourceStats: Record<string, { registrations: number; trials: number; paid: number }> = {};
  
  users.forEach(user => {
    const source = user.source || 'direct';
    if (!sourceStats[source]) {
      sourceStats[source] = { registrations: 0, trials: 0, paid: 0 };
    }
    sourceStats[source].registrations++;
    if (user.stripeCustomerId) {
      sourceStats[source].trials++;
      // Check if actually paid $39.97 from Stripe
      const stripeData = stripePayments.get(user.stripeCustomerId);
      if (stripeData?.hasPaidFullPrice) {
        sourceStats[source].paid++;
      }
    }
  });

  const landingPageData = Object.entries(sourceStats)
    .map(([source, stats]) => ({
      source,
      registrations: stats.registrations,
      trials: stats.trials,
      trialRate: stats.registrations > 0 ? ((stats.trials / stats.registrations) * 100).toFixed(1) : '0',
      paid: stats.paid,
      paidRate: stats.registrations > 0 ? ((stats.paid / stats.registrations) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.registrations - a.registrations);

  // Daily cohort analysis - with accurate Stripe payment data
  const dailyCohorts: Record<string, {
    date: string;
    registered: number;
    startedTrial: number;
    active: number;
    churned: number;
    neverPaid: number;
    paidEver: number;
    trialEndDate: Date;
  }> = {};

  users.forEach(user => {
    const dateKey = user.createdAt.toISOString().split('T')[0];
    if (!dailyCohorts[dateKey]) {
      const trialEnd = new Date(user.createdAt);
      trialEnd.setDate(trialEnd.getDate() + 14);
      dailyCohorts[dateKey] = {
        date: dateKey,
        registered: 0,
        startedTrial: 0,
        active: 0,
        churned: 0,
        neverPaid: 0,
        paidEver: 0,
        trialEndDate: trialEnd,
      };
    }
    dailyCohorts[dateKey].registered++;
    
    if (user.stripeCustomerId) {
      dailyCohorts[dateKey].startedTrial++;
      
      // Check actual Stripe payment
      const stripeData = stripePayments.get(user.stripeCustomerId);
      const hasPaidFull = stripeData?.hasPaidFullPrice === true;
      
      if (hasPaidFull) {
        dailyCohorts[dateKey].paidEver++;
        if (user.subscriptionStatus === 'active') {
          dailyCohorts[dateKey].active++;
        } else {
          dailyCohorts[dateKey].churned++;
        }
      }
    } else {
      dailyCohorts[dateKey].neverPaid++;
    }
  });

  const cohortData = Object.values(dailyCohorts)
    .sort((a, b) => a.date.localeCompare(b.date));

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
    <AnalyticsTabWrapper>
      <AnalyticsDashboard
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
          startedTrial,
          paidEver,
          trialsEnded,
          trialsStillActive,
          rebillSuccessRate,
          canceledDuringTrial,
          churned,
          churnRate,
          dailyAvg,
        }}
        users={users.map(u => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        }))}
        chartData={chartData}
        landingPageData={landingPageData}
        cohortData={cohortData.map(c => ({
          ...c,
          trialEndDate: c.trialEndDate.toISOString(),
        }))}
      />
    </AnalyticsTabWrapper>
  );
}
