'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { EmbeddedCheckoutComponent } from '@/components/embedded-checkout';
import { useRouter } from 'next/navigation';
import { trackLead } from '@/lib/analytics';

export default function PaymentPage() {
  const router = useRouter();
  const [checkoutError, setCheckoutError] = useState('');

  // Track page view
  useEffect(() => {
    trackLead(); // Tracks payment page view
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 py-6 md:py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center max-w-2xl w-full">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span className="text-white text-xs md:text-sm font-medium">Profile</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-purple-900 mb-2 font-bold">
                2
              </div>
              <span className="text-white text-xs md:text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 text-center">
          Activate Your Trial
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Complete your payment to start your 14-day trial for just $1
        </p>
        
        {checkoutError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{checkoutError}</span>
          </div>
        )}

        <Card>
          <CardHeader className="text-center">
            <CardTitle>14-Day Trial - Just $1</CardTitle>
            <CardDescription>
              Then $39.97/month after trial • Cancel anytime
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <EmbeddedCheckoutComponent onError={setCheckoutError} />
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/onboarding/step4')}
            className="text-white hover:text-gray-300 underline text-sm"
          >
            ← Back to previous step
          </button>
        </div>
      </div>
    </div>
  );
}
