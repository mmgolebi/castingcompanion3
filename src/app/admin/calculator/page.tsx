import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ForecastCalculator from './ForecastCalculator';

export default async function CalculatorPage() {
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

  // Get current metrics to pre-populate
  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: new Date('2025-10-28T00:00:00Z') },
      role: 'ACTOR',
    },
    select: {
      createdAt: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
    },
  });

  const totalRegistrations = users.length;
  const usersWithTrial = users.filter(u => u.stripeCustomerId).length;
  
  const daysSince = (date: Date) => {
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  const usersTrialEnded = users.filter(u => u.stripeCustomerId && daysSince(u.createdAt) >= 14);
  const successfulRebills = usersTrialEnded.filter(u => 
    u.subscriptionStatus === 'active' || u.subscriptionStatus === 'ACTIVE'
  ).length;

  const regToTrialRate = totalRegistrations > 0 
    ? (usersWithTrial / totalRegistrations) * 100 
    : 0;
  
  const rebillRate = usersTrialEnded.length > 0 
    ? (successfulRebills / usersTrialEnded.length) * 100 
    : 50; // Default assumption if no data

  const activeCustomers = users.filter(u => 
    u.subscriptionStatus === 'active' || u.subscriptionStatus === 'ACTIVE'
  ).length;

  return (
    <ForecastCalculator
      currentMetrics={{
        regToTrialRate: parseFloat(regToTrialRate.toFixed(1)),
        rebillRate: parseFloat(rebillRate.toFixed(1)),
        currentMRR: activeCustomers * 39.97,
        activeCustomers,
      }}
    />
  );
}
