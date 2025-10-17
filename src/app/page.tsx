'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Target, Mail, Clock, TrendingUp, Star, MapPin, DollarSign, Calendar, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">Casting Companion</div>
          <div className="flex gap-4">
            <Link href="/about">
              <Button variant="ghost" className="text-white hover:bg-white/10">About</Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" className="text-white hover:bg-white/10">FAQ</Button>
            </Link>
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
                    Get Started Today
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              {/* Actual Video */}
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-purple-500 shadow-2xl">
                <video 
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
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
          </div>
        </div>
      </section>

      {/* Real Casting Call Examples */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">See Real Casting Calls We Auto-Submit To</h2>
            <p className="text-xl text-gray-600">These are the types of opportunities our system finds for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Casting Call 1 */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    LEAD
                  </span>
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">Auto-Submitted</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Lead Role - Netflix Series</h3>
                <p className="text-gray-600 mb-4 text-sm">Drama series seeking diverse cast for principal photography</p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Los Angeles, CA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>$5,000/week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Shoots: March 2025</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-500">Match Score</span>
                  <span className="text-2xl font-bold text-green-600">92%</span>
                </div>
              </CardContent>
            </Card>

            {/* Casting Call 2 */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    COMMERCIAL
                  </span>
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">Auto-Submitted</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">National Commercial - Major Brand</h3>
                <p className="text-gray-600 mb-4 text-sm">Lifestyle commercial for major consumer brand</p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>New York, NY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>$2,500 + residuals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Shoots: February 2025</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-500">Match Score</span>
                  <span className="text-2xl font-bold text-green-600">88%</span>
                </div>
              </CardContent>
            </Card>

            {/* Casting Call 3 */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    SUPPORTING
                  </span>
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">Auto-Submitted</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Supporting Role - HBO Series</h3>
                <p className="text-gray-600 mb-4 text-sm">Recurring character for award-winning drama series</p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Atlanta, GA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>$3,000/episode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Shoots: April 2025</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-500">Match Score</span>
                  <span className="text-2xl font-bold text-green-600">95%</span>
                </div>
              </CardContent>
            </Card>

            {/* Casting Call 4 */}
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                    BACKGROUND
                  </span>
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">Auto-Submitted</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Featured Background - Feature Film</h3>
                <p className="text-gray-600 mb-4 text-sm">Multiple days of work for major studio production</p>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Chicago, IL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>$200/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Shoots: January 2025</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-500">Match Score</span>
                  <span className="text-2xl font-bold text-green-600">87%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Story Timeline */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How Sarah Landed Her Netflix Role</h2>
            <p className="text-xl text-gray-600">From auto-submission to booking in 8 days</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-purple-200"></div>

              {/* Timeline Item 1 */}
              <div className="relative flex gap-6 mb-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold z-10 relative">
                    Day 1
                  </div>
                </div>
                <Card className="flex-1">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Zap className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">Auto-Submitted at 2:00 AM</h3>
                        <p className="text-gray-600 mb-3">
                          While Sarah was sleeping, our system found a Netflix series casting call that matched her profile at 92%. 
                          We automatically submitted her headshot, resume, and reel.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800 font-semibold">
                            ✓ Match Score: 92% • Lead Role • $5,000/week
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative flex gap-6 mb-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold z-10 relative">
                    Day 3
                  </div>
                </div>
                <Card className="flex-1">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Mail className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">Callback Request</h3>
                        <p className="text-gray-600 mb-3">
                          Sarah received an email from the casting director requesting a self-tape audition. 
                          She had 48 hours to submit her audition video.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            "Your profile stood out among hundreds of submissions. We'd love to see your take on this character."
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Item 3 */}
              <div className="relative flex gap-6 mb-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold z-10 relative">
                    Day 5
                  </div>
                </div>
                <Card className="flex-1">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Target className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">In-Person Audition</h3>
                        <p className="text-gray-600 mb-3">
                          Her self-tape was well-received. Sarah was invited for an in-person chemistry read with the series lead 
                          at the Netflix production office.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Item 4 */}
              <div className="relative flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white z-10 relative">
                    <Check className="h-8 w-8" />
                  </div>
                </div>
                <Card className="flex-1 border-2 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Star className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-green-700">Booked the Role!</h3>
                        <p className="text-gray-600 mb-3">
                          Sarah received the offer on Day 8. She's now filming her first Netflix series as a recurring character 
                          with a contract for 6 episodes.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-800 font-semibold mb-2">
                            💰 Total Earnings: $30,000
                          </p>
                          <p className="text-sm text-gray-700 italic">
                            "I never would have seen this casting call on my own. CastingCompanion literally changed my career."
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
            {/* Disney */}
            <div className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              <img 
                src="https://cdn.worldvectorlogo.com/logos/disney--1.svg" 
                alt="Disney"
                className="h-16 w-auto"
              />
            </div>

            {/* Netflix */}
            <div className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              <img 
                src="https://cdn.worldvectorlogo.com/logos/netflix-3.svg" 
                alt="Netflix"
                className="h-16 w-auto"
              />
            </div>

            {/* Prime Video */}
            <div className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              <img 
                src="https://cdn.worldvectorlogo.com/logos/amazon-prime-video-1.svg" 
                alt="Prime Video"
                className="h-16 w-auto"
              />
            </div>

            {/* HBO */}
            <div className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
              <img 
                src="https://cdn.worldvectorlogo.com/logos/hbo-4.svg" 
                alt="HBO"
                className="h-14 w-auto"
              />
            </div>
          </div>
        </div>
      </section>

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

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Actors Are Saying</h2>
            <p className="text-xl text-gray-600">Real stories from working actors</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "I booked three background roles in my first month! The auto-submit feature is a game changer. I used to spend 2-3 hours a day searching Backstage and Actors Access. Now I just get emails when I'm submitted. Worth every penny."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center font-semibold text-purple-700">
                    SM
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Martinez</div>
                    <div className="text-sm text-gray-500">Los Angeles, CA</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "As a SAG-AFTRA member juggling a day job, I can't be glued to casting sites all day. CastingCompanion submits me to union gigs while I'm at work. I've had 4 auditions this month that I would have completely missed otherwise."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center font-semibold text-blue-700">
                    JC
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">James Chen</div>
                    <div className="text-sm text-gray-500">New York, NY</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "Finally landed a co-star role on a Netflix series! The match score feature helped me understand which roles I was actually competitive for. The algorithm is incredibly accurate and has completely changed how I approach auditioning."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center font-semibold text-green-700">
                    AP
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Aisha Patel</div>
                    <div className="text-sm text-gray-500">Atlanta, GA</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 4 */}
            <Card className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "I'm non-union and new to the industry. The algorithm found student films and indie projects perfect for my experience level. I've built my reel with 8 projects in 4 months. My agent is impressed!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center font-semibold text-pink-700">
                    MR
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Marcus Rodriguez</div>
                    <div className="text-sm text-gray-500">Chicago, IL</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 5 */}
            <Card className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "The time savings alone is worth it. I was spending 15+ hours a week applying to roles. Now I spend maybe 30 minutes checking my submissions. More time for classes and audition prep. This is the future of casting!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center font-semibold text-orange-700">
                    EK
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Emily Kowalski</div>
                    <div className="text-sm text-gray-500">Austin, TX</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 6 */}
            <Card className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "Booked 2 national commercials in 3 months. The notifications are instant - I got submitted to a Verizon spot 5 minutes after it was posted. First one to audition! Customer support is also super responsive."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center font-semibold text-indigo-700">
                    DW
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">David Washington</div>
                    <div className="text-sm text-gray-500">Miami, FL</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-white font-bold text-xl mb-4">Casting Companion</div>
              <p className="text-sm">
                Automated casting call submissions for actors. Never miss an opportunity.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
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
