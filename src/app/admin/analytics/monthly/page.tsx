'use client';

import { useState, useEffect } from 'react';

interface MonthlyData {
  month: string;
  label: string;
  adSpend: number;
  fixedCosts: number;
  totalCosts: number;
  trialRevenue: number;
  subscriptionRevenue: number;
  totalRevenue: number;
  profit: number;
  registrations: number;
  newTrials: number;
  conversions: number;
  activeSubscribers: number;
  conversionRate: string;
}

interface ApiResponse {
  months: MonthlyData[];
  totals: {
    adSpend: number;
    fixedCosts: number;
    totalCosts: number;
    totalRevenue: number;
    profit: number;
    registrations: number;
    newTrials: number;
    conversions: number;
    currentActiveSubscribers: number;
  };
}

export default function MonthlyPLPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/monthly-pl?year=${year}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly P&L</h1>
          <p className="text-gray-600 mt-1">Track revenue, costs, and profit by month</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear(year - 1)}
            className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            ←
          </button>
          <span className="px-4 py-2 font-semibold text-gray-900 bg-white rounded-lg border border-gray-200">
            {year}
          </span>
          <button
            onClick={() => setYear(year + 1)}
            disabled={year >= new Date().getFullYear()}
            className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Loading monthly data...</span>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-gray-500">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(data.totals.totalRevenue)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-gray-500">Total Costs</div>
              <div className="text-2xl font-bold text-pink-600 mt-1">
                {formatCurrency(data.totals.totalCosts)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-gray-500">YTD Profit</div>
              <div className={`text-2xl font-bold mt-1 ${data.totals.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(data.totals.profit)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-gray-500">Total Trials</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {data.totals.newTrials}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-gray-500">Total Converted</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {data.totals.conversions}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-gray-500">Active Now</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {data.totals.currentActiveSubscribers}
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600">Month</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600">Ad Spend</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600">Fixed</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600">Revenue</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600">Profit/Loss</th>
                    <th className="text-right py-4 px-4 font-semibold text-blue-600 bg-blue-50">New Trials</th>
                    <th className="text-right py-4 px-4 font-semibold text-purple-600 bg-purple-50">Converted</th>
                    <th className="text-right py-4 px-4 font-semibold text-green-600 bg-green-50">Active</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-600">Conv %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.months.map((month) => (
                    <tr key={month.month} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900">{month.label}</div>
                        <div className="text-xs text-gray-400">{month.registrations} registrations</div>
                      </td>
                      <td className="py-4 px-4 text-right text-pink-600 font-medium">
                        {formatCurrency(month.adSpend)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-500">
                        {formatCurrency(month.fixedCosts)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="text-green-600 font-medium">{formatCurrency(month.totalRevenue)}</div>
                        <div className="text-xs text-gray-400">
                          ${month.trialRevenue.toFixed(0)} + ${month.subscriptionRevenue.toFixed(0)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          month.profit >= 0 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {month.profit >= 0 ? '+' : ''}{formatCurrency(month.profit)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right bg-blue-50/50">
                        <span className="font-bold text-blue-600 text-lg">{month.newTrials}</span>
                      </td>
                      <td className="py-4 px-4 text-right bg-purple-50/50">
                        <span className="font-bold text-purple-600 text-lg">{month.conversions}</span>
                      </td>
                      <td className="py-4 px-4 text-right bg-green-50/50">
                        <span className="font-bold text-green-600 text-lg">{month.activeSubscribers}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-semibold ${
                          parseFloat(month.conversionRate) >= 50 ? 'text-green-600' :
                          parseFloat(month.conversionRate) >= 30 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {month.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr className="font-bold">
                    <td className="py-4 px-4 text-gray-900">
                      Total
                      <div className="text-xs text-gray-400 font-normal">{data.totals.registrations} registrations</div>
                    </td>
                    <td className="py-4 px-4 text-right text-pink-600">
                      {formatCurrency(data.totals.adSpend)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-500">
                      {formatCurrency(data.totals.fixedCosts)}
                    </td>
                    <td className="py-4 px-4 text-right text-green-600">
                      {formatCurrency(data.totals.totalRevenue)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        data.totals.profit >= 0 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {data.totals.profit >= 0 ? '+' : ''}{formatCurrency(data.totals.profit)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right bg-blue-50/50 text-blue-600 text-lg">
                      {data.totals.newTrials}
                    </td>
                    <td className="py-4 px-4 text-right bg-purple-50/50 text-purple-600 text-lg">
                      {data.totals.conversions}
                    </td>
                    <td className="py-4 px-4 text-right bg-green-50/50 text-green-600 text-lg">
                      {data.totals.currentActiveSubscribers}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-600">
                      {data.totals.newTrials > 0 
                        ? ((data.totals.conversions / data.totals.newTrials) * 100).toFixed(1) 
                        : '0'}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Profit/Loss Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Profit/Loss Trend</h2>
            <div className="flex items-end justify-center gap-8 h-48">
              {data.months.map((month) => {
                const maxProfit = Math.max(...data.months.map(m => Math.abs(m.profit)));
                const height = maxProfit > 0 ? (Math.abs(month.profit) / maxProfit) * 100 : 0;
                const isPositive = month.profit >= 0;
                
                return (
                  <div key={month.month} className="flex flex-col items-center gap-2 flex-1 max-w-32">
                    <div className="text-sm font-semibold text-gray-600">
                      {formatCurrency(month.profit)}
                    </div>
                    <div className="w-full flex flex-col items-center justify-end h-32">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isPositive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                        }`}
                        style={{ height: `${height}%`, minHeight: '8px' }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                      {month.label.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel (All Time)</h2>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-center">
                <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                  <div>
                    <div className="text-2xl font-bold text-gray-700">{data.totals.registrations}</div>
                    <div className="text-xs text-gray-500">Regs</div>
                  </div>
                </div>
              </div>
              <div className="text-gray-300 text-2xl">→</div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{data.totals.newTrials}</div>
                    <div className="text-xs text-blue-600">Trials</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {((data.totals.newTrials / data.totals.registrations) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-gray-300 text-2xl">→</div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                  <div>
                    <div className="text-xl font-bold text-purple-600">{data.totals.conversions}</div>
                    <div className="text-xs text-purple-600">Paid</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {data.totals.newTrials > 0 ? ((data.totals.conversions / data.totals.newTrials) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="text-gray-300 text-2xl">→</div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <div>
                    <div className="text-xl font-bold text-green-600">{data.totals.currentActiveSubscribers}</div>
                    <div className="text-xs text-green-600">Active</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  ${(data.totals.currentActiveSubscribers * 39.97).toFixed(0)} MRR
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
