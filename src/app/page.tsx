'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Target, Mail, Clock, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">Casting Companion</div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-white text-purple-600 hover:bg-gray-100">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Never Miss a{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Perfect Casting Call
                </span>{' '}
                Again
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                We automatically submit your profile to casting calls that match your criteria. 
                Stop manually searching and applying. Let opportunities find you.
              </p>
              <div className="flex gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="text-lg bg-white text-purple-600 hover:bg-gray-100">
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg bg-transparent text-white border-white hover:bg-white/10">
                  Watch Demo
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                $1 trial for 30 days, then $39.97/month
              </p>
            </div>

            <div className="relative">
              {/* Video placeholder - replace with actual video embed */}
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center border-2 border-purple-500">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[20px] border-l-white border-y-[12px] border-y-transparent ml-1"></div>
                  </div>
                  <p className="text-gray-400">Video: How Casting Companion Works</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Logos Section */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-12">
            The latest from top networks
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center max-w-5xl mx-auto">
            {/* Disney+ */}
            <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <img 
                src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/disneyplus.svg" 
                alt="Disney+"
                className="h-12 w-auto"
                style={{ filter: 'invert(25%) sepia(98%) saturate(2476%) hue-rotate(206deg) brightness(98%) contrast(101%)' }}
              />
            </div>

            {/* Netflix */}
            <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <img 
                src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/netflix.svg" 
                alt="Netflix"
                className="h-12 w-auto"
                style={{ filter: 'invert(14%) sepia(97%) saturate(7426%) hue-rotate(356deg) brightness(91%) contrast(115%)' }}
              />
            </div>

            {/* Prime Video */}
            <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <img 
                src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/primevideo.svg" 
                alt="Prime Video"
                className="h-10 w-auto"
                style={{ filter: 'invert(60%) sepia(79%) saturate(2878%) hue-rotate(166deg) brightness(99%) contrast(101%)' }}
              />
            </div>

            {/* HBO Max */}
            <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <img 
                src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/hbo.svg" 
                alt="HBO"
                className="h-10 w-auto"
                style={{ filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the page remains the same... */}
      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-center text-gray-600 mb-12">Simple, automated, and effective</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Create Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Complete your actor profile with photos, resume, and preferences. 
                  Tell us what roles you're looking for.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. We Match You Automatically</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our algorithm analyzes new casting calls and calculates your compatibility 
                  based on age, location, experience, and more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. Get Auto-Submitted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  When a casting call matches you 85% or higher, we automatically submit 
                  your materials and notify you via email.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Actors Love Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Save Hours Every Week</h3>
                <p className="text-gray-600">
                  Stop manually searching casting boards. We do the work for you 24/7.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Never Miss an Opportunity</h3>
                <p className="text-gray-600">
                  Get submitted immediately when new matching roles are posted.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Smart Matching Algorithm</h3>
                <p className="text-gray-600">
                  Our system considers age, location, union status, ethnicity, and more.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Email Notifications</h3>
                <p className="text-gray-600">
                  Stay informed every time we submit your profile to a casting call.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Professional Dashboard</h3>
                <p className="text-gray-600">
                  Track all your submissions and see your match scores in one place.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Cancel Anytime</h3>
                <p className="text-gray-600">
                  No long-term commitment. Pay month-to-month and cancel whenever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Pro Plan</CardTitle>
              <div className="text-5xl font-bold text-primary mt-4">
                $39.97<span className="text-xl text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mt-2">First 30 days only $1</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Unlimited auto-submissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Smart matching algorithm</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Email notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Professional dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
              <Link href="/auth/register" className="block">
                <Button size="lg" className="w-full">
                  Start Your $1 Trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Land Your Next Role?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Join hundreds of actors who never miss a casting opportunity
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg">
              Get Started for $1
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-white font-bold text-xl mb-4">Casting Companion</div>
              <p className="text-sm">
                Automated casting call submissions for actors. Never miss an opportunity.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm">
                Questions? Email us at<br />
                <a href="mailto:support@castingcompanion.com" className="hover:text-white">
                  support@castingcompanion.com
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 Casting Companion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
