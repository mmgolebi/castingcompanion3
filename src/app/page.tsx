'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Target, Mail, Clock, TrendingUp, Star } from 'lucide-react';

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
              </div>
              <p className="text-sm text-gray-400 mt-4">
                $1 trial for 14 days, then $39.97/month
              </p>
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
                src="https://cdn.worldvectorlogo.com/logos/disney-2.svg" 
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
                  "Finally landed a co-star role on a Netflix series! The match score feature helped me understand which roles I was actually competitive for. The $40/month pays for itself - my last booking covered it for 6 months."
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

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Pro Plan</CardTitle>
              <div className="text-5xl font-bold text-primary mt-4">
                $39.97<span className="text-xl text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mt-2">First 14 days only $1</p>
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
