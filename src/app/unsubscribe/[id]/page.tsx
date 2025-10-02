'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';

export default function UnsubscribePage() {
  const params = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const unsubscribe = async () => {
      try {
        const res = await fetch(`/api/unsubscribe/${params.id}`, {
          method: 'POST',
        });

        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    unsubscribe();
  }, [params.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Unsubscribed Successfully'}
            {status === 'error' && 'Something Went Wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && <p>Please wait...</p>}
          {status === 'success' && (
            <p>You will no longer receive submissions from this casting call.</p>
          )}
          {status === 'error' && (
            <p>Unable to process your request. Please contact support.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
