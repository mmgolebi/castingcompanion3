'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Casting Companion!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your profile is complete and you're ready to start finding casting opportunities.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Redirecting to your dashboard in 3 seconds...
          </p>
        </div>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="text-primary hover:underline text-sm"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}
