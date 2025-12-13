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
  trials: number;
  activeSubscribers: number;
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
    trials: number;
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                {data.totals.trials}
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
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Month</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Ad Spend</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Fixed Costs</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Total Costs</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Revenue</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Profit/Loss</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Regs</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Trials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.months.map((month) => (
                    <tr key={month.month} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{month.label}</div>
                      </td>
                      <td className="py-4 px-6 text-right text-pink-600 font-medium">
                        {formatCurrency(month.adSpend)}
                      </td>
                      <td className="py-4 px-6 text-right text-gray-600">
                        {formatCurrency(month.fixedCosts)}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-gray-900">
                        {formatCurrency(month.totalCosts)}
                      </td>
                      <td className="py-4 px-6 text-right text-green-600 font-medium">
                        {formatCurrency(month.totalRevenue)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          month.profit >= 0 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {month.profit >= 0 ? '+' : ''}{formatCurrency(month.profit)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-blue-600 font-medium">
                        {month.registrations}
                      </td>
                      <td className="py-4 px-6 text-right text-purple-600 font-medium">
                        {month.trials}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr className="font-bold">
                    <td className="py-4 px-6 text-gray-900">Total</td>
                    <td className="py-4 px-6 text-right text-pink-600">
                      {formatCurrency(data.totals.adSpend)}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-600">
                      {formatCurrency(data.totals.fixedCosts)}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-900">
                      {formatCurrency(data.totals.totalCosts)}
                    </td>
                    <td className="py-4 px-6 text-right text-green-600">
                      {formatCurrency(data.totals.totalRevenue)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        data.totals.profit >= 0 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {data.totals.profit >= 0 ? '+' : ''}{formatCurrency(data.totals.profit)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-blue-600">
                      {data.totals.registrations}
                    </td>
                    <td className="py-4 px-6 text-right text-purple-600">
                      {data.totals.trials}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Visual Chart - Monthly Profit/Loss Bars */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Profit/Loss Trend</h2>
            <div className="flex items-end justify-between gap-2 h-48">
              {data.months.map((month) => {
                const maxProfit = Math.max(...data.months.map(m => Math.abs(m.profit)));
                const height = maxProfit > 0 ? (Math.abs(month.profit) / maxProfit) * 100 : 0;
                const isPositive = month.profit >= 0;
                
                return (
                  <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-40">
                      {isPositive ? (
                        <div 
                          className="w-full bg-emerald-500 rounded-t-lg transition-all duration-300 hover:bg-emerald-600"
                          style={{ height: `${height}%`, minHeight: month.profit !== 0 ? '4px' : '0' }}
                          title={`${month.label}: ${formatCurrency(month.profit)}`}
                        />
                      ) : (
                        <div 
                          className="w-full bg-red-500 rounded-b-lg transition-all duration-300 hover:bg-red-600"
                          style={{ height: `${height}%`, minHeight: month.profit !== 0 ? '4px' : '0' }}
                          title={`${month.label}: ${formatCurrency(month.profit)}`}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {month.label.split(' ')[0].slice(0, 3)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span className="text-gray-600">Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Loss</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
