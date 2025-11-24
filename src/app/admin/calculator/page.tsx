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

  const isCanceled = (status: string | null) => 
    status === 'canceled' || status === 'CANCELED' || status === 'cancelled';
  
  const isActive = (status: string | null) => 
    status === 'active' || status === 'ACTIVE';

  // Users whose trial has ended (14+ days ago)
  const usersTrialEnded = users.filter(u => u.stripeCustomerId && daysSince(u.createdAt) >= 14);
  
  // Currently active customers
  const currentlyActive = usersTrialEnded.filter(u => isActive(u.subscriptionStatus)).length;
  
  // Churned = paid $39.97 but then canceled (trial ended + canceled)
  const churnedCustomers = usersTrialEnded.filter(u => isCanceled(u.subscriptionStatus)).length;
  
  // Successful rebills = anyone who paid $39.97 (active + churned)
  const successfulRebills = currentlyActive + churnedCustomers;

  // Registration to trial rate
  const regToTrialRate = totalRegistrations > 0 
    ? (usersWithTrial / totalRegistrations) * 100 
    : 0;
  
  // Rebill rate = successful rebills / trials that ended
  const rebillRate = usersTrialEnded.length > 0 
    ? (successfulRebills / usersTrialEnded.length) * 100 
    : 50; // Default assumption if no data

  // Churn rate = churned / successful rebills
  const churnRate = successfulRebills > 0
    ? (churnedCustomers / successfulRebills) * 100
    : 25; // Default assumption

  return (
    <ForecastCalculator
      currentMetrics={{
        regToTrialRate: parseFloat(regToTrialRate.toFixed(1)),
        rebillRate: parseFloat(rebillRate.toFixed(1)),
        churnRate: parseFloat(churnRate.toFixed(1)),
        currentMRR: currentlyActive * 39.97,
        activeCustomers: currentlyActive,
        totalPaying: successfulRebills,
        churnedCustomers,
      }}
    />
  );
}
