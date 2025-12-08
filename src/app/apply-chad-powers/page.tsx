'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Check, Zap, Mail, Star, TrendingUp } from 'lucide-react';
import { trackCompleteRegistration } from '@/lib/analytics';

function ApplyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const castingEmail = 'football@gamechangingfilms.com';
  const castingTitle = 'Chad Powers Season 2';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  // Track page view for apply page
  useEffect(() => {
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Register the user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: 'ACTOR', source: 'chad-powers' }),
      });

      if (res.ok) {
        // Track registration conversion
        trackCompleteRegistration();
        
        // Store show name for payment page
        localStorage.setItem("landingPageShowName", "Chad Powers Season 2");
        
        // Automatically sign them in
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          // Redirect to onboarding step 1
          router.push('/onboarding/step1');
        } else {
          setError('Account created, but login failed. Please log in manually.');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToRegister = () => {
    const element = document.getElementById('register');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="text-3xl font-bold text-white inline-block">Casting Companion</div>
          </Link>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-8">
            <div className="inline-block bg-yellow-500 text-black px-6 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse">
              🏈 NOW CASTING
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              CHAD POWERS SEASON 2 CASTING CALLS
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              New roles available • Apply in seconds
            </p>
          </div>

          {/* Video */}
          <div className="mb-8">
            <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden border-4 border-green-500 shadow-2xl">
              <video 
                className="w-full h-full object-cover"
                autoPlay
                loop
                playsInline
                controls
                preload="auto"
                poster="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800"
              >
                <source 
                  src="https://storage.googleapis.com/msgsndr/e9HzxNWnJSWGniDtfueu/media/68e9184635e869cb9b194fd2.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* CTAs */}
          <div className="text-center space-y-4 mb-16">
            <Button 
              onClick={scrollToRegister}
              size="lg" 
              className="w-full md:w-auto text-xl px-12 py-8 bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all"
            >
              <Zap className="mr-2 h-6 w-6" />
              Create Your Casting Profile Now
            </Button>
            
            <div>
              <button
                onClick={() => setShowManualModal(true)}
                className="text-gray-400 hover:text-gray-300 text-sm underline"
              >
                No thanks, I want to submit myself manually
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Why actors choose CastingCompanion
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Auto-Submit</h3>
                <p className="text-gray-300 text-sm">
                  We automatically submit you to matching roles 24/7
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Save Time</h3>
                <p className="text-gray-300 text-sm">
                  Never manually search casting boards again
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Never Miss</h3>
                <p className="text-gray-300 text-sm">
                  Get instant notifications for new opportunities
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof Above Testimonials */}
          <div className="text-center mb-8">
            <p className="text-2xl md:text-3xl font-bold text-white">
              Join <span className="text-green-400">1,247 actors</span> already booked through Casting Companion
            </p>
          </div>

          {/* Testimonials Section */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              Hear from actors who landed roles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4 italic">
                  "I landed 3 auditions in my first week! The auto-submit feature is a game-changer. No more spending hours searching casting boards."
                </p>
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                    alt="Sarah M."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Sarah M.</div>
                    <div className="text-xs text-gray-500">Los Angeles, CA</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4 italic">
                  "Finally booked a speaking role on a Netflix series! CastingCompanion matched me to opportunities I never would have found on my own."
                </p>
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
                    alt="Marcus T."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Marcus T.</div>
                    <div className="text-xs text-gray-500">New York, NY</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4 italic">
                  "Got my first co-star role within 2 weeks of signing up. Way better than scrolling through Backstage for hours every day!"
                </p>
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" 
                    alt="Jessica L."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Jessica L.</div>
                    <div className="text-xs text-gray-500">Atlanta, GA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Below Testimonials */}
          <div className="text-center mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 inline-block">
              <div className="flex items-center gap-3 justify-center">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <p className="text-2xl md:text-3xl font-bold text-white">
                  Actors using our service get <span className="text-green-400">3x more auditions</span>
                </p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div id="register" className="bg-white rounded-xl shadow-2xl p-8 md:p-12 scroll-mt-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Complete Your Chad Powers Application
                </h2>
                <p className="text-gray-600 text-lg">
                  Create your actor profile and get submitted to the Chad Powers Season 2 casting call PLUS dozens of other matching roles automatically
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700"
                >
                  {loading ? 'Creating Profile...' : 'Create My Profile'}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-green-600 font-semibold hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm mb-4">Trusted by actors landing roles at</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <img src="https://cdn.worldvectorlogo.com/logos/netflix-3.svg" alt="Netflix" className="h-8 w-auto" />
              <img src="https://cdn.worldvectorlogo.com/logos/hbo-4.svg" alt="HBO" className="h-7 w-auto" />
              <img src="https://cdn.worldvectorlogo.com/logos/disney--1.svg" alt="Disney" className="h-10 w-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Casting Companion. All rights reserved.</p>
        </div>
      </footer>

      {/* Manual Submission Modal */}
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Manually</DialogTitle>
            <DialogDescription>
              You can email the casting director directly
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-blue-900 mb-1">Casting Director Email:</p>
                  <a 
                    href={`mailto:${castingEmail}?subject=Application for ${castingTitle}`}
                    className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                  >
                    {castingEmail}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Want this done professionally?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                With Casting Companion, your submissions are formatted professionally and sent automatically to roles that match your profile - dramatically increasing your chances of getting callbacks.
              </p>
              <Button 
                onClick={() => {
                  setShowManualModal(false);
                  scrollToRegister();
                }}
                className="w-full bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700"
                size="sm"
              >
                Sign Up for Professional Submissions
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowManualModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <ApplyPageContent />
    </Suspense>
  );
}
