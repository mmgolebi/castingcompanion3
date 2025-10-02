'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Check, CreditCard } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Almost There!</h1>
          <p className="text-gray-600">Start your 14-day trial for just $1</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-1">14-Day Trial</p>
            <div className="text-4xl font-bold text-gray-900">$1</div>
            <p className="text-sm text-gray-600">then $39.97/month after trial</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">Access to all casting calls</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">AI-powered role matching</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">Unlimited submissions</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">Professional profile showcase</p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">Cancel anytime</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full h-12 text-lg"
        >
          {loading ? (
            'Processing...'
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Start $1 Trial
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500 mt-4">
          Secure payment powered by Stripe. You'll be charged $1 today to start your 14-day trial, then $39.97/month after the trial ends. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
