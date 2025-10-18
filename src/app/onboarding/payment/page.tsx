'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Star, Zap, Shield, Lock, RotateCcw } from 'lucide-react';
import { EmbeddedCheckoutComponent } from '@/components/embedded-checkout';
import { useRouter } from 'next/navigation';

// Track InitiateCheckout event
const trackInitiateCheckout = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'InitiateCheckout', {
      content_name: 'Casting Companion Trial',
      value: 1.00,
      currency: 'USD'
    });
  }
};

export default function PaymentPage() {
  const router = useRouter();
  const [checkoutError, setCheckoutError] = useState('');

  // Track InitiateCheckout when payment page loads
  useEffect(() => {
    trackInitiateCheckout();

    // Track payment page view in GHL
    fetch("/api/track-payment-view", { method: "POST" }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 py-6 md:py-12 px-4">
      <div className="container mx-auto max-w-4xl">
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

        <div className="text-center mb-6">
          <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse">
            🎯 Last Step: Activate Your $1 Offer
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Lock In Your Spot & Get Auto-Submitted
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-3">
            You'll be automatically submitted to the <span className="text-purple-300 font-semibold">Euphoria Season 3 casting call</span> you came here for, 
            <span className="text-purple-300 font-semibold"> plus hundreds of other matching roles</span> - all on autopilot.
          </p>
          <p className="text-base md:text-lg text-gray-300">
            Complete payment to activate your 14-day full access for just $1
          </p>
        </div>
        
        {checkoutError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{checkoutError}</span>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">14-Day Full Access - Just $1</CardTitle>
            <CardDescription className="text-base">
              Then $39.97/month • Cancel anytime
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <EmbeddedCheckoutComponent onError={setCheckoutError} />
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-1">Secure Payment</h3>
              <p className="text-gray-300 text-sm">
                256-bit SSL encryption via Stripe
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                <RotateCcw className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-1">Money-Back Guarantee</h3>
              <p className="text-gray-300 text-sm">
                Not satisfied? Full refund within 14 days
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-1">Cancel Anytime</h3>
              <p className="text-gray-300 text-sm">
                No contracts, no hassle - cancel in 1 click
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Actors who got auto-submitted to roles they never expected
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-lg p-5 shadow-xl">
              <div className="flex items-center gap-1 mb-3">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">AUTO-SUBMITTED</span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm mb-3 italic">
                "Woke up to an email saying I was auto-submitted to a Netflix series. Booked my first paid co-star role without even knowing the casting call existed!"
              </p>
              <div className="flex items-center gap-2">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" 
                  alt="David R."
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">David R.</div>
                  <div className="text-xs text-gray-500">Chicago, IL</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-lg p-5 shadow-xl">
              <div className="flex items-center gap-1 mb-3">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">AUTO-SUBMITTED</span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm mb-3 italic">
                "Landed a lead role in an indie film that I was auto-matched to at 2am while I was sleeping. The system literally works overnight for you!"
              </p>
              <div className="flex items-center gap-2">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" 
                  alt="Maya P."
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Maya P.</div>
                  <div className="text-xs text-gray-500">Brooklyn, NY</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-lg p-5 shadow-xl">
              <div className="flex items-center gap-1 mb-3">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">AUTO-SUBMITTED</span>
              </div>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm mb-3 italic">
                "Got callbacks for 3 different background roles in one week - all from auto-submissions. Made $1,200 without lifting a finger to apply!"
              </p>
              <div className="flex items-center gap-2">
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" 
                  alt="Alex M."
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Alex M.</div>
                  <div className="text-xs text-gray-500">Atlanta, GA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Value Reminder */}
        <div className="bg-purple-800/50 backdrop-blur-lg border border-purple-600 rounded-lg p-6 mb-6 text-center">
          <p className="text-white text-lg font-semibold mb-2">
            ⚡ Your profile is complete and ready
          </p>
          <p className="text-purple-200 text-sm">
            The moment you activate, you'll be auto-submitted to matching roles 24/7 while you sleep, work, or audition for other projects.
          </p>
        </div>

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
