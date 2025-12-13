'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  createdAt: string;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
}

interface Metrics {
  totalRegistrations: number;
  trials: number;
  activeSubscriptions: number;
  inactive: number;
  canceled: number;
  trialConversionRate: string;
  paidConversionRate: string;
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

type StatusFilter = 'all' | 'trial' | 'active' | 'inactive' | 'canceled';

export default function AnalyticsDashboard({ fromDate, toDate, metrics, users, chartData }: Props) {
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

  // Get user status for filtering
  const getUserStatus = (user: User): StatusFilter => {
    const status = user.subscriptionStatus?.toLowerCase();
    if (status === 'trialing' || status === 'trial') return 'trial';
    if (status === 'active') return 'active';
    if (status === 'canceled' || status === 'cancelled') return 'canceled';
    return 'inactive';
  };

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => getUserStatus(user) === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [users, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Status badge component
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

  // Count by status (use metrics for accurate counts)
  const statusCounts = {
    all: users.length,
    trial: metrics.trials,
    active: metrics.activeSubscriptions,
    inactive: metrics.inactive,
    canceled: metrics.canceled,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalRegistrations}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Trials</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{metrics.trials}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Active Subs</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{metrics.activeSubscriptions}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Inactive</div>
          <div className="text-3xl font-bold text-gray-500 mt-1">{metrics.inactive}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Canceled</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{metrics.canceled}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Trial Conv.</div>
          <div className="text-3xl font-bold text-purple-600 mt-1">{metrics.trialConversionRate}%</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500">Paid Conv.</div>
          <div className="text-3xl font-bold text-emerald-600 mt-1">{metrics.paidConversionRate}%</div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Apply
          </button>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => quickFilter(0)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Today
            </button>
            <button
              onClick={() => quickFilter(7)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Last 7 days
            </button>
            <button
              onClick={() => quickFilter(30)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Last 30 days
            </button>
            <button
              onClick={() => router.push(`/admin/analytics?from=2025-10-28&to=${new Date().toISOString().split('T')[0]}`)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              All time
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Registrations</h3>
          <div className="h-48 flex items-end gap-1">
            {chartData.slice(-30).map((day, i) => {
              const maxReg = Math.max(...chartData.slice(-30).map(d => d.registrations));
              const height = maxReg > 0 ? (day.registrations / maxReg) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-500 font-medium">{day.registrations}</div>
                  <div 
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${height}%`, minHeight: day.registrations > 0 ? '4px' : '0' }}
                    title={`${day.date}: ${day.registrations} registrations, ${day.trials} trials`}
                  />
                  {chartData.slice(-30).length <= 14 && (
                    <div className="text-xs text-gray-400 -rotate-45 origin-top-left mt-1">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header with Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Users ({filteredUsers.length})
            </h2>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm w-64"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Status Filter Tabs */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {(['all', 'trial', 'active', 'inactive', 'canceled'] as StatusFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      statusFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                    <span className="ml-1 text-xs opacity-75">({statusCounts[filter]})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Stripe</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-400">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{user.email}</td>
                  <td className="py-3 px-4">
                    <StatusBadge user={user} />
                  </td>
                  <td className="py-3 px-4">
                    {user.stripeCustomerId ? (
                      <span className="inline-flex px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                        ✓ Connected
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
