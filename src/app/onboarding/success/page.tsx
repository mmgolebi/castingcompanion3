'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { trackPurchase } from '@/lib/analytics';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Track successful purchase
    trackPurchase(1.00, 'USD');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Casting Companion!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your payment was successful. Your profile is now active and we'll start matching you with casting calls immediately.
        </p>

        <div className="space-y-4">
          <Link href="/dashboard">
            <Button className="w-full h-12 text-base">
              Go to Dashboard
            </Button>
          </Link>
          
          <Link href="/dashboard/profile">
            <Button variant="outline" className="w-full h-12 text-base">
              Complete Your Profile
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          You'll receive an email confirmation shortly.
        </p>
      </div>
    </div>
  );
}
