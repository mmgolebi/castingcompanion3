'use client';

import { useEffect, useState } from 'react';
import LandingPageStats from './LandingPageStats';

interface LandingPageData {
  source: string;
  registrations: number;
  trials: number;
  paid: number;
  trialRate: string;
  paidRate: string;
}

interface Props {
  fromDate: string;
  toDate: string;
}

export default function LandingPageSection({ fromDate, toDate }: Props) {
  const [data, setData] = useState<LandingPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/analytics/landing-pages?from=${fromDate}&to=${toDate}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data || []);
        } else {
          setError('Failed to load landing page data');
        }
      } catch (err) {
        setError('Failed to load landing page data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fromDate, toDate]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">📊 Landing Page Performance</h2>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">📊 Landing Page Performance</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">📊 Landing Page Performance</h2>
        <p className="text-gray-500">No landing page data available for this date range.</p>
        <p className="text-sm text-gray-400 mt-2">Note: Landing page tracking was just added. New registrations will be tracked going forward.</p>
      </div>
    );
  }

  return <LandingPageStats data={data} />;
}
