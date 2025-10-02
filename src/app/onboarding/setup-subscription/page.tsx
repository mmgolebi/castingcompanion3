'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SetupSubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    const setupSubscription = async () => {
      const sessionId = searchParams?.get('session_id');
      
      console.log('Session ID from URL:', sessionId);
      
      if (!sessionId) {
        if (!attempted) {
          // Wait a bit for searchParams to load
          setAttempted(true);
          return;
        }
        setError('Missing session information');
        return;
      }

      try {
        console.log('Calling API with sessionId:', sessionId);
        
        const res = await fetch('/api/stripe/setup-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (res.ok) {
          router.push('/onboarding/success');
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to set up subscription');
        }
      } catch (err) {
        console.error('Setup error:', err);
        setError('An error occurred');
      }
    };

    setupSubscription();
  }, [searchParams, router, attempted]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="bg-white p-8 rounded-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/onboarding/payment')}
            className="text-blue-600 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white p-8 rounded-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-700">Setting up your subscription...</p>
      </div>
    </div>
  );
}

export default function SetupSubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SetupSubscriptionContent />
    </Suspense>
  );
}
