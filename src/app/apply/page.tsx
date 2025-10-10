'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, Zap } from 'lucide-react';
import { trackLead, trackCompleteRegistration } from '@/lib/analytics';

export default function ApplyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Track page view for apply page
  useEffect(() => {
    trackLead();
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
        body: JSON.stringify({ email, password, name, role: 'ACTOR' }),
      });

      if (res.ok) {
        // Track registration conversion
        trackCompleteRegistration();
        
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
            <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse">
              🔴 NOW CASTING
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Stranger Things Season 5
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              New roles available • Apply in seconds
            </p>
          </div>

          {/* Video */}
          <div className="mb-8">
            <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden border-4 border-purple-500 shadow-2xl">
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
              className="w-full md:w-auto text-xl px-12 py-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all"
            >
              <Zap className="mr-2 h-6 w-6" />
              Create Your Casting Profile Now
            </Button>
            
            <div>
              <Link 
                href="/auth/login" 
                className="text-gray-400 hover:text-gray-300 text-sm underline"
              >
                No thanks, I want to submit myself manually
              </Link>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-16">
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
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Never Miss</h3>
                <p className="text-gray-300 text-sm">
                  Get instant notifications for new opportunities
                </p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div id="register" className="bg-white rounded-xl shadow-2xl p-8 md:p-12 scroll-mt-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Start Your Free Trial
                </h2>
                <p className="text-gray-600">
                  $1 for 14 days, then $39.97/month • Cancel anytime
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
                  className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? 'Creating Account...' : 'Start My $1 Trial'}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-purple-600 font-semibold hover:underline">
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
              <img src="https://cdn.worldvectorlogo.com/logos/disney-2.svg" alt="Disney" className="h-10 w-auto" />
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
    </div>
  );
}
