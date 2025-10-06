'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';

function SetupSubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const setupSubscription = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setStatus('error');
          return;
        }

        // Call the API to create the subscription
        const res = await fetch('/api/stripe/setup-subscription', {
          method: 'POST',
        });

        if (res.ok) {
          setStatus('success');
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard?trial=started');
          }, 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Setup error:', error);
        setStatus('error');
      }
    };

    setupSubscription();
  }, [searchParams, router]);

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-center">
          {status === 'loading' && 'Setting up your trial...'}
          {status === 'success' && 'Trial activated!'}
          {status === 'error' && 'Setup failed'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <p className="text-center text-gray-600">
              Please wait while we activate your 14-day trial...
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <p className="text-center text-gray-600">
              Your trial is active! You'll be charged $39.97/month after 14 days.
              Redirecting to dashboard...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <p className="text-center text-red-600">
              Something went wrong. Please contact support.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function SetupSubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <Suspense fallback={
        <Card className="max-w-md w-full">
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          </CardContent>
        </Card>
      }>
        <SetupSubscriptionContent />
      </Suspense>
    </div>
  );
}
