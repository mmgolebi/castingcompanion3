'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

interface Metrics {
  totalRegistrations: number;
  trials: number;
  activeSubscriptions: number;
  inactive: number;
  canceled: number;
  trialConversionRate: string;
  paidConversionRate: string;
}

interface User {
  id: string;
  email: string;
  createdAt: string;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
}

interface ChartDataPoint {
  date: string;
  registrations: number;
  trials: number;
  active: number;
}

interface Props {
  fromDate: string;
  toDate: string;
  metrics: Metrics;
  users: User[];
  chartData: ChartDataPoint[];
}

export default function AnalyticsDashboard({ fromDate, toDate, metrics, users, chartData }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);

  const applyFilter = () => {
    router.push(`/admin/analytics?from=${from}&to=${to}`);
  };

  const quickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFrom(start.toISOString().split('T')[0]);
    setTo(end.toISOString().split('T')[0]);
    router.push(`/admin/analytics?from=${start.toISOString().split('T')[0]}&to=${end.toISOString().split('T')[0]}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      trialing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Trial' },
      TRIAL: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Trial' },
      trial: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Trial' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      canceled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Canceled' },
      CANCELED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Canceled' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Canceled' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
    };
    const config = statusMap[status || 'inactive'] || statusMap.inactive;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const daysSince = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isCanceled = (status: string | null) => 
    status === 'canceled' || status === 'CANCELED' || status === 'cancelled';
  
  const isActive = (status: string | null) => 
    status === 'active' || status === 'ACTIVE';

  const isTrialing = (status: string | null) => 
    status === 'trialing' || status === 'TRIAL' || status === 'trial';

  // Users who started a trial (paid $1)
  const usersWithTrial = users.filter(u => u.stripeCustomerId);
  
  // Users whose 14-day trial period has ended
  const usersTrialEnded = usersWithTrial.filter(u => daysSince(u.createdAt) >= 14);
  
  // Users still in trial period
  const usersTrialActive = usersWithTrial.filter(u => daysSince(u.createdAt) < 14);

  // FIXED: Successful rebills = anyone who paid $39.97 (active OR canceled-after-trial)
  // If trial ended and they're canceled, they likely paid first then canceled
  const currentlyActive = usersTrialEnded.filter(u => isActive(u.subscriptionStatus)).length;
  const canceledAfterTrial = usersTrialEnded.filter(u => isCanceled(u.subscriptionStatus)).length;
  const successfulRebills = currentlyActive + canceledAfterTrial;

  // Trial cancellations = canceled BEFORE trial ended (never paid $39.97)
  const trialCancellations = usersWithTrial.filter(u => 
    isCanceled(u.subscriptionStatus) && daysSince(u.createdAt) < 14
  ).length;

  // Churn = paid $39.97 but then canceled
  const churnedCustomers = canceledAfterTrial;

  // Rebill rate (of trials that ended, how many paid $39.97)
  const rebillRate = usersTrialEnded.length > 0 
    ? ((successfulRebills / usersTrialEnded.length) * 100).toFixed(1)
    : 'N/A';

  // Trial cancellation rate (canceled during trial / all trials started)
  const trialCancelRate = usersWithTrial.length > 0
    ? ((trialCancellations / usersWithTrial.length) * 100).toFixed(1)
    : '0';

  // Churn rate (of successful rebills, how many later canceled)
  const churnRate = successfulRebills > 0
    ? ((churnedCustomers / successfulRebills) * 100).toFixed(1)
    : '0';

  // Registration to trial rate
  const regToTrialRate = metrics.totalRegistrations > 0
    ? ((usersWithTrial.length / metrics.totalRegistrations) * 100).toFixed(1)
    : '0';

  // Forecasting metrics
  const avgDailyRegistrations = chartData.length > 0
    ? (metrics.totalRegistrations / chartData.length).toFixed(1)
    : '0';

  const projectedMonthlyRegistrations = (parseFloat(avgDailyRegistrations) * 30).toFixed(0);
  
  const projectedMonthlyTrials = rebillRate !== 'N/A'
    ? (parseFloat(projectedMonthlyRegistrations) * (parseFloat(regToTrialRate) / 100)).toFixed(0)
    : 'N/A';

  const projectedMonthlyPaying = rebillRate !== 'N/A' && projectedMonthlyTrials !== 'N/A'
    ? (parseFloat(projectedMonthlyTrials) * (parseFloat(rebillRate) / 100)).toFixed(0)
    : 'N/A';

  const projectedMRR = projectedMonthlyPaying !== 'N/A'
    ? (parseFloat(projectedMonthlyPaying) * 39.97).toFixed(2)
    : 'N/A';

  const estimatedLTV = (39.97 * 3).toFixed(2);

  const totalTrialRevenue = usersWithTrial.length * 1;
  const revenuePerRegistration = metrics.totalRegistrations > 0
    ? (totalTrialRevenue / metrics.totalRegistrations).toFixed(2)
    : '0';

  // Daily breakdown with corrected logic
  const dailyBreakdown = chartData.map(day => {
    const dayUsers = users.filter(u => u.createdAt.startsWith(day.date));
    const daysAgo = daysSince(day.date);
    const trialEnded = daysAgo >= 14;
    
    const startedTrial = dayUsers.filter(u => u.stripeCustomerId).length;
    const nowActive = dayUsers.filter(u => isActive(u.subscriptionStatus)).length;
    const nowCanceled = dayUsers.filter(u => isCanceled(u.subscriptionStatus)).length;
    const stillTrialing = dayUsers.filter(u => isTrialing(u.subscriptionStatus)).length;
    const neverPaid = dayUsers.filter(u => !u.stripeCustomerId).length;

    // For cohort rebill rate: if trial ended, count active + canceled as "rebilled"
    const cohortRebills = trialEnded ? nowActive + nowCanceled : 0;
    const cohortTrialsEnded = trialEnded ? startedTrial : 0;
    const cohortRebillRate = cohortTrialsEnded > 0 
      ? ((cohortRebills / cohortTrialsEnded) * 100).toFixed(0)
      : null;

    return {
      date: day.date,
      daysAgo,
      trialEnded,
      registrations: dayUsers.length,
      startedTrial,
      stillTrialing,
      nowActive,
      churned: trialEnded ? nowCanceled : 0,
      trialCanceled: !trialEnded ? nowCanceled : 0,
      neverPaid,
      cohortRebillRate,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track registrations, trials, and conversions</p>
          </div>
          <Link
            href="/admin/calculator"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2"
          >
            🧮 Forecast Calculator
          </Link>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilter}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => quickFilter(7)}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 text-sm"
              >
                Last 7 days
              </button>
              <button
                onClick={() => quickFilter(30)}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 text-sm"
              >
                Last 30 days
              </button>
              <button
                onClick={() => {
                  setFrom('2025-10-28');
                  setTo(new Date().toISOString().split('T')[0]);
                  router.push(`/admin/analytics?from=2025-10-28&to=${new Date().toISOString().split('T')[0]}`);
                }}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 text-sm"
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Registrations</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalRegistrations}</div>
            <div className="text-sm text-gray-500 mt-1">{avgDailyRegistrations}/day avg</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Started Trial</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{usersWithTrial.length}</div>
            <div className="text-sm text-gray-500 mt-1">{regToTrialRate}% of registrations</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Currently Active</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{currentlyActive}</div>
            <div className="text-sm text-gray-500 mt-1">${(currentlyActive * 39.97).toFixed(2)} MRR</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Paying (Ever)</div>
            <div className="text-3xl font-bold text-emerald-600 mt-2">{successfulRebills}</div>
            <div className="text-sm text-gray-500 mt-1">{currentlyActive} active + {churnedCustomers} churned</div>
          </div>
        </div>

        {/* Conversion Metrics - Now with 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-500">Registration → Trial</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{regToTrialRate}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {usersWithTrial.length} of {metrics.totalRegistrations} registered
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-sm font-medium text-gray-500">Rebill Success Rate</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {rebillRate === 'N/A' ? 'N/A' : `${rebillRate}%`}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {usersTrialEnded.length > 0 
                ? `${successfulRebills} of ${usersTrialEnded.length} trials that ended`
                : 'No trials ended yet'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="text-sm font-medium text-gray-500">Trial Cancellation</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">{trialCancelRate}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {trialCancellations} canceled during trial
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="text-sm font-medium text-gray-500">Customer Churn</div>
            <div className="text-3xl font-bold text-red-600 mt-2">{churnRate}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {churnedCustomers} of {successfulRebills} paying customers left
            </div>
          </div>
        </div>

        {/* Forecasting Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-purple-900">📊 30-Day Forecast (based on current rates)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded p-4">
              <div className="text-xs font-medium text-gray-500">Projected Registrations</div>
              <div className="text-2xl font-bold text-gray-900">{projectedMonthlyRegistrations}</div>
              <div className="text-xs text-gray-500">@ {avgDailyRegistrations}/day</div>
            </div>
            <div className="bg-white rounded p-4">
              <div className="text-xs font-medium text-gray-500">Projected Trials</div>
              <div className="text-2xl font-bold text-blue-600">{projectedMonthlyTrials}</div>
              <div className="text-xs text-gray-500">@ {regToTrialRate}% conversion</div>
            </div>
            <div className="bg-white rounded p-4">
              <div className="text-xs font-medium text-gray-500">Projected New Customers</div>
              <div className="text-2xl font-bold text-green-600">{projectedMonthlyPaying}</div>
              <div className="text-xs text-gray-500">@ {rebillRate}% rebill rate</div>
            </div>
            <div className="bg-white rounded p-4">
              <div className="text-xs font-medium text-gray-500">Projected MRR Growth</div>
              <div className="text-2xl font-bold text-purple-600">
                {projectedMRR !== 'N/A' ? `$${projectedMRR}` : 'N/A'}
              </div>
              <div className="text-xs text-gray-500">@ $39.97/customer</div>
            </div>
          </div>
        </div>

        {/* Unit Economics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">💰 Unit Economics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Trial Revenue</div>
              <div className="text-xl font-bold">${totalTrialRevenue}</div>
              <div className="text-xs text-gray-500">{usersWithTrial.length} × $1</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Revenue per Registration</div>
              <div className="text-xl font-bold">${revenuePerRegistration}</div>
              <div className="text-xs text-gray-500">Trial $ / Total regs</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Estimated LTV</div>
              <div className="text-xl font-bold">${estimatedLTV}</div>
              <div className="text-xs text-gray-500">Assuming 3mo retention</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Current MRR</div>
              <div className="text-xl font-bold">${(currentlyActive * 39.97).toFixed(2)}</div>
              <div className="text-xs text-gray-500">{currentlyActive} × $39.97</div>
            </div>
          </div>
        </div>

        {/* Pending Trials Alert */}
        {usersTrialActive.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 text-xl">⏳</span>
              <div>
                <div className="font-medium text-yellow-800">
                  {usersTrialActive.length} trials still active
                </div>
                <div className="text-sm text-yellow-700">
                  These users haven&apos;t reached their rebill date yet. Check back in {Math.min(...usersTrialActive.map(u => 14 - daysSince(u.createdAt)))} days for first conversion.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Conversion Funnel</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Registrations</span>
                <span className="text-sm text-gray-600">{metrics.totalRegistrations}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-gray-600 h-4 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Started Trial ($1 paid)</span>
                <span className="text-sm text-gray-600">{usersWithTrial.length} ({regToTrialRate}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${regToTrialRate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Paid $39.97 (ever)</span>
                <span className="text-sm text-gray-600">
                  {successfulRebills} ({usersTrialEnded.length > 0 ? ((successfulRebills / usersTrialEnded.length) * 100).toFixed(1) : 0}% of ended trials)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-emerald-600 h-4 rounded-full" style={{ width: `${metrics.totalRegistrations > 0 ? (successfulRebills / metrics.totalRegistrations) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Currently Active</span>
                <span className="text-sm text-gray-600">
                  {currentlyActive} ({successfulRebills > 0 ? ((currentlyActive / successfulRebills) * 100).toFixed(1) : 0}% retention)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-green-600 h-4 rounded-full" style={{ width: `${metrics.totalRegistrations > 0 ? (currentlyActive / metrics.totalRegistrations) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        {dailyBreakdown.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Daily Cohort Analysis</h2>
            <p className="text-sm text-gray-500 mb-4">Shows what happened to users who registered on each day</p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Trial Status</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Registered</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Started Trial</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Active</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Churned</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Rebill %</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Never Paid $1</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyBreakdown.map((day) => (
                    <tr key={day.date} className={`border-b hover:bg-gray-50 ${!day.trialEnded ? 'bg-yellow-50' : ''}`}>
                      <td className="py-2 px-3 text-sm font-medium">{day.date}</td>
                      <td className="py-2 px-3 text-center">
                        {day.trialEnded ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Trial ended
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {14 - day.daysAgo} days left
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-sm text-right">{day.registrations}</td>
                      <td className="py-2 px-3 text-sm text-right text-blue-600 font-medium">{day.startedTrial}</td>
                      <td className="py-2 px-3 text-sm text-right text-green-600 font-medium">{day.nowActive}</td>
                      <td className="py-2 px-3 text-sm text-right text-red-600">{day.churned}</td>
                      <td className="py-2 px-3 text-sm text-right">
                        {day.cohortRebillRate !== null ? (
                          <span className={`font-medium ${parseFloat(day.cohortRebillRate) >= 50 ? 'text-green-600' : parseFloat(day.cohortRebillRate) >= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {day.cohortRebillRate}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-sm text-right text-gray-400">
                        {!day.trialEnded && day.neverPaid > 0 ? (
                          <span className="text-yellow-600" title="Trial still active">
                            {day.neverPaid} ⏳
                          </span>
                        ) : (
                          day.neverPaid
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded"></div>
                <span>Trial period active</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⏳</span>
                <span>Still within trial window</span>
              </div>
            </div>
          </div>
        )}

        {/* User List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">All Users ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Registered</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Current Status</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Trial Status</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Stripe ID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userDaysAgo = daysSince(user.createdAt);
                  const userTrialEnded = userDaysAgo >= 14;
                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm">{user.email}</td>
                      <td className="py-2 px-3 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                      <td className="py-2 px-3">{getStatusBadge(user.subscriptionStatus)}</td>
                      <td className="py-2 px-3">
                        {userTrialEnded ? (
                          <span className="text-xs text-gray-500">Ended</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {14 - userDaysAgo}d left
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-500 font-mono">
                        {user.stripeCustomerId || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
