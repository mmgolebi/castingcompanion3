'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  createdAt: string;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  source: string | null;
}

interface Metrics {
  totalRegistrations: number;
  trials: number;
  activeSubscriptions: number;
  inactive: number;
  canceled: number;
  trialConversionRate: string;
  paidConversionRate: string;
  startedTrial: number;
  paidEver: number;
  trialsEnded: number;
  trialsStillActive: number;
  rebillSuccessRate: string;
  canceledDuringTrial: number;
  churned: number;
  churnRate: string;
  dailyAvg: string;
}

interface ChartDataPoint {
  date: string;
  registrations: number;
  trials: number;
  active: number;
}

interface LandingPageData {
  source: string;
  registrations: number;
  trials: number;
  trialRate: string;
  paid: number;
  paidRate: string;
}

interface CohortData {
  date: string;
  registered: number;
  startedTrial: number;
  active: number;
  churned: number;
  neverPaid: number;
  paidEver: number;
  trialEndDate: string;
}

interface Props {
  fromDate: string;
  toDate: string;
  metrics: Metrics;
  users: User[];
  chartData: ChartDataPoint[];
  landingPageData: LandingPageData[];
  cohortData: CohortData[];
}

type StatusFilter = 'all' | 'trial' | 'active' | 'inactive' | 'canceled';

const sourceColors: Record<string, string> = {
  'tyler-perry': 'bg-red-500',
  'apply': 'bg-purple-500',
  'direct': 'bg-gray-500',
  'chad-powers': 'bg-gray-400',
  'hunting-wives': 'bg-green-500',
  'tulsa-king': 'bg-gray-300',
  'the-bear': 'bg-gray-200',
  'euphoria': 'bg-purple-400',
};

const sourceLabels: Record<string, string> = {
  'tyler-perry': 'Tyler Perry (/apply-tyler-perry)',
  'apply': 'Euphoria (/apply)',
  'direct': 'Direct / Other',
  'chad-powers': 'chad-powers',
  'hunting-wives': 'Hunting Wives (/apply-hunting-wives)',
  'tulsa-king': 'tulsa-king',
  'the-bear': 'the-bear',
};

export default function AnalyticsDashboard({ fromDate, toDate, metrics, users, chartData, landingPageData, cohortData }: Props) {
  const router = useRouter();
  
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 100;

  const handleFilter = () => {
    if (from && to) {
      router.push(`/admin/analytics?from=${from}&to=${to}`);
    }
  };

  const quickFilter = (days: number) => {
    if (days === 0) {
      const today = new Date().toISOString().split('T')[0];
      setFrom(today);
      setTo(today);
      router.push(`/admin/analytics?from=${today}&to=${today}`);
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    setFrom(startStr);
    setTo(endStr);
    router.push(`/admin/analytics?from=${startStr}&to=${endStr}`);
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

  const getUserStatus = (user: User): StatusFilter => {
    const status = user.subscriptionStatus?.toLowerCase();
    if (status === 'trialing' || status === 'trial') return 'trial';
    if (status === 'active') return 'active';
    if (status === 'canceled' || status === 'cancelled') return 'canceled';
    return 'inactive';
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => getUserStatus(user) === statusFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(query) ||
        (user.source && user.source.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [users, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const StatusBadge = ({ user }: { user: User }) => {
    const status = getUserStatus(user);
    const styles: Record<StatusFilter, string> = {
      trial: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-600',
      canceled: 'bg-red-100 text-red-700',
      all: 'bg-gray-100 text-gray-600',
    };
    const labels: Record<StatusFilter, string> = {
      trial: 'Trial',
      active: 'Active',
      inactive: 'Free',
      canceled: 'Canceled',
      all: 'Unknown',
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const statusCounts = {
    all: users.length,
    trial: metrics.trials,
    active: metrics.activeSubscriptions,
    inactive: metrics.inactive,
    canceled: metrics.canceled,
  };

  const oldestActiveTrial = cohortData
    .filter(c => new Date(c.trialEndDate) > new Date())
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  
  const daysUntilFirstConversion = oldestActiveTrial 
    ? Math.ceil((new Date(oldestActiveTrial.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={handleFilter} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Apply</button>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => quickFilter(0)} className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700">Today</button>
            <button onClick={() => quickFilter(7)} className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700">Last 7 days</button>
            <button onClick={() => quickFilter(30)} className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700">Last 30 days</button>
            <button onClick={() => router.push(`/admin/analytics?from=2025-10-28&to=${new Date().toISOString().split('T')[0]}`)} className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700">All time</button>
          </div>
        </div>
      </div>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-gray-400">
          <div className="text-sm font-medium text-gray-500">Total Registrations</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalRegistrations}</div>
          <div className="text-xs text-gray-400 mt-1">{metrics.dailyAvg}/day avg</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-blue-500">
          <div className="text-sm font-medium text-gray-500">Started Trial</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{metrics.startedTrial}</div>
          <div className="text-xs text-gray-400 mt-1">{metrics.trialConversionRate}% of registrations</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-orange-500">
          <div className="text-sm font-medium text-gray-500">Currently Active</div>
          <div className="text-3xl font-bold text-orange-600 mt-1">{metrics.activeSubscriptions}</div>
          <div className="text-xs text-gray-400 mt-1">${(metrics.activeSubscriptions * 39.97).toFixed(2)} MRR</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-amber-500">
          <div className="text-sm font-medium text-gray-500">Trials Still Active</div>
          <div className="text-3xl font-bold text-amber-600 mt-1">{metrics.trialsStillActive}</div>
          <div className="text-xs text-gray-400 mt-1">{metrics.trialsEnded} trials ended</div>
        </div>
      </div>

      {/* Secondary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-blue-400">
          <div className="text-sm font-medium text-gray-500">Registration → Trial</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{metrics.trialConversionRate}%</div>
          <div className="text-xs text-gray-400 mt-1">{metrics.startedTrial} of {metrics.totalRegistrations} registered</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-yellow-400">
          <div className="text-sm font-medium text-gray-500">Trial Cancellation</div>
          <div className="text-3xl font-bold text-yellow-600 mt-1">
            {metrics.startedTrial > 0 ? ((metrics.canceledDuringTrial / metrics.startedTrial) * 100).toFixed(1) : '0'}%
          </div>
          <div className="text-xs text-gray-400 mt-1">{metrics.canceledDuringTrial} canceled during trial</div>
        </div>
      </div>

      {/* Active Trials Notice */}
      {metrics.trialsStillActive > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <div className="font-semibold text-amber-800">{metrics.trialsStillActive} trials still active</div>
            <div className="text-sm text-amber-600">
              These users haven&apos;t reached their rebill date yet. Check back in {daysUntilFirstConversion} days for first conversion.
            </div>
          </div>
        </div>
      )}


      {/* Stripe-Verified Metrics */}
      {/* Conversion Funnel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Registrations</span>
              <span className="text-sm font-medium text-gray-900">{metrics.totalRegistrations}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gray-600 h-3 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Started Trial ($1 paid)</span>
              <span className="text-sm font-medium text-gray-900">{metrics.startedTrial} ({metrics.trialConversionRate}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(metrics.startedTrial / metrics.totalRegistrations) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Paid $39.97 (ever)</span>
              <span className="text-sm font-medium text-gray-900">{metrics.paidEver} ({metrics.rebillSuccessRate}% of ended trials)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(metrics.paidEver / metrics.totalRegistrations) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Currently Active</span>
              <span className="text-sm font-medium text-gray-900">{metrics.activeSubscriptions} ({metrics.paidEver > 0 ? ((metrics.activeSubscriptions / metrics.paidEver) * 100).toFixed(1) : 0}% retention)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: `${(metrics.activeSubscriptions / metrics.totalRegistrations) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Landing Page Performance */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Landing Page Performance</h2>
        
        <div className="flex rounded-lg overflow-hidden h-8 mb-4">
          {landingPageData.map((lp, i) => {
            const width = (lp.registrations / metrics.totalRegistrations) * 100;
            const color = sourceColors[lp.source] || 'bg-gray-400';
            return (
              <div key={i} className={`${color} flex items-center justify-center text-white text-xs font-medium`} style={{ width: `${width}%` }} title={`${sourceLabels[lp.source] || lp.source}: ${lp.registrations}`}>
                {width > 8 && `${width.toFixed(0)}%`}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          {landingPageData.map((lp, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${sourceColors[lp.source] || 'bg-gray-400'}`} />
              <span className="text-gray-600">{sourceLabels[lp.source] || lp.source}</span>
            </div>
          ))}
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-3 font-semibold text-gray-600">Landing Page</th>
              <th className="text-right py-3 font-semibold text-gray-600">Registrations</th>
              <th className="text-right py-3 font-semibold text-gray-600">Trials Started</th>
              <th className="text-right py-3 font-semibold text-gray-600">Trial Rate</th>
              <th className="text-right py-3 font-semibold text-gray-600">Paid $39.97</th>
              <th className="text-right py-3 font-semibold text-gray-600">Paid Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {landingPageData.map((lp, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="py-3 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${sourceColors[lp.source] || 'bg-gray-400'}`} />
                  <span className="font-medium text-gray-900">{sourceLabels[lp.source] || lp.source}</span>
                </td>
                <td className="py-3 text-right font-medium text-gray-900">{lp.registrations}</td>
                <td className="py-3 text-right">
                  <span className="inline-flex px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{lp.trials}</span>
                </td>
                <td className="py-3 text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded font-medium ${parseFloat(lp.trialRate) >= 7 ? 'bg-green-100 text-green-700' : parseFloat(lp.trialRate) >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{lp.trialRate}%</span>
                </td>
                <td className="py-3 text-right">
                  <span className="inline-flex px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">{lp.paid}</span>
                </td>
                <td className="py-3 text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded font-medium ${parseFloat(lp.paidRate) >= 3 ? 'bg-green-100 text-green-700' : parseFloat(lp.paidRate) >= 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{lp.paidRate}%</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 font-bold">
            <tr>
              <td className="py-3 text-gray-900">Total</td>
              <td className="py-3 text-right text-gray-900">{metrics.totalRegistrations}</td>
              <td className="py-3 text-right text-blue-700">{metrics.startedTrial}</td>
              <td className="py-3 text-right text-gray-500">-</td>
              <td className="py-3 text-right text-green-700">{metrics.paidEver}</td>
              <td className="py-3 text-right text-gray-500">-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Daily Cohort Analysis */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Daily Cohort Analysis</h2>
        <p className="text-sm text-gray-500 mb-4">Shows what happened to users who registered on each day (verified from Stripe invoices)</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 font-semibold text-gray-600">Date</th>
                <th className="text-center py-3 font-semibold text-gray-600">Trial Status</th>
                <th className="text-right py-3 font-semibold text-gray-600">Registered</th>
                <th className="text-right py-3 font-semibold text-gray-600">Started Trial</th>
                <th className="text-right py-3 font-semibold text-gray-600">Paid $39.97</th>
                <th className="text-right py-3 font-semibold text-gray-600">Active</th>
                <th className="text-right py-3 font-semibold text-gray-600">Churned</th>
                <th className="text-right py-3 font-semibold text-gray-600">Rebill %</th>
                <th className="text-right py-3 font-semibold text-gray-600">Never Paid $1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cohortData.map((cohort, i) => {
                const trialEnded = new Date(cohort.trialEndDate) <= new Date();
                const daysLeft = Math.ceil((new Date(cohort.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const rebillRate = cohort.startedTrial > 0 && trialEnded 
                  ? ((cohort.paidEver / cohort.startedTrial) * 100).toFixed(0)
                  : null;
                
                return (
                  <tr key={i} className={`hover:bg-gray-50 ${!trialEnded ? 'bg-yellow-50/50' : ''}`}>
                    <td className="py-3 font-medium text-gray-900">{cohort.date}</td>
                    <td className="py-3 text-center">
                      {trialEnded ? (
                        <span className="text-xs text-gray-500">Trial ended</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">{daysLeft} days left</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">{cohort.registered}</td>
                    <td className="py-3 text-right"><span className="text-blue-600 font-medium">{cohort.startedTrial}</span></td>
                    <td className="py-3 text-right"><span className="text-green-600 font-bold">{cohort.paidEver}</span></td>
                    <td className="py-3 text-right"><span className="text-green-600 font-medium">{cohort.active}</span></td>
                    <td className="py-3 text-right"><span className="text-red-600 font-medium">{cohort.churned}</span></td>
                    <td className="py-3 text-right">
                      {rebillRate !== null ? (
                        <span className={`font-semibold ${parseFloat(rebillRate) >= 70 ? 'text-green-600' : parseFloat(rebillRate) >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>{rebillRate}%</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {!trialEnded && cohort.neverPaid > 0 ? (
                        <span className="text-gray-500">{cohort.neverPaid} ⏳</span>
                      ) : (
                        <span className="text-gray-500">{cohort.neverPaid}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Users ({filteredUsers.length})</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input type="text" placeholder="Search email, source..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm w-64" />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {(['all', 'trial', 'active', 'inactive', 'canceled'] as StatusFilter[]).map((filter) => (
                  <button key={filter} onClick={() => handleFilterChange(filter)} className={`px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === filter ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                    <span className="ml-1 text-xs opacity-75">({statusCounts[filter]})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Source</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-400">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{user.email}</td>
                  <td className="py-3 px-4"><StatusBadge user={user} /></td>
                  <td className="py-3 px-4">
                    {user.source ? (<span className="inline-flex px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-medium">{user.source}</span>) : (<span className="text-gray-300">—</span>)}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50">First</button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50">← Prev</button>
              <span className="px-3 py-1.5 text-sm">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Next →</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Last</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
