'use client';

import { useState } from 'react';

interface StripeMetrics {
  paidFullPrice: number;
  activeAfterPaying: number;
  churnedAfterPaying: number;
  trialsEnded: number;
  rebillRate: string;
  churnRate: string;
}

export default function StripeVerifiedMetrics() {
  const [metrics, setMetrics] = useState<StripeMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStripeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stripe-payments');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMetrics(data.metrics);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-sm border border-purple-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            💳 Stripe-Verified Metrics
          </h2>
          <p className="text-sm text-gray-500">
            Accurate payment data from Stripe invoices (who actually paid $39.97)
          </p>
        </div>
        <button
          onClick={fetchStripeData}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </>
          ) : (
            <>🔄 {metrics ? 'Refresh' : 'Load'} from Stripe</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {metrics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm font-medium text-gray-500">Paid $39.97 (Ever)</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{metrics.paidFullPrice}</div>
              <div className="text-xs text-gray-400">Verified from Stripe</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm font-medium text-gray-500">Rebill Success Rate</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{metrics.rebillRate}%</div>
              <div className="text-xs text-gray-400">{metrics.paidFullPrice} of {metrics.trialsEnded} trials</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm font-medium text-gray-500">Still Active</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{metrics.activeAfterPaying}</div>
              <div className="text-xs text-gray-400">After paying $39.97</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm font-medium text-gray-500">Customer Churn</div>
              <div className="text-2xl font-bold text-red-600 mt-1">{metrics.churnRate}%</div>
              <div className="text-xs text-gray-400">{metrics.churnedAfterPaying} of {metrics.paidFullPrice} left</div>
            </div>
          </div>
          {lastUpdated && (
            <div className="text-xs text-gray-400 text-right">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </>
      ) : !loading && (
        <div className="text-center py-8 text-gray-500">
          Click &quot;Load from Stripe&quot; to see verified payment metrics
        </div>
      )}
    </div>
  );
}
