#!/bin/bash

# Complete setup script for new apply pages WITH analytics tracking
# Run this from your castingcompanion3 root directory

echo "🎬 Setting up apply pages with analytics tracking..."

# ============================================
# Step 1: Update Prisma Schema - Add source field
# ============================================
echo "📦 Updating Prisma schema..."

# Check if source field already exists
if grep -q "source.*String?" prisma/schema.prisma; then
  echo "   Source field already exists in schema"
else
  # Add source field to User model after role
  sed -i '' '/role.*Role.*@default(ACTOR)/a\
  source             String?
' prisma/schema.prisma
  echo "   Added 'source' field to User model"
fi

# ============================================
# Step 2: Update Register API to accept source
# ============================================
echo "📝 Updating register API..."

cat > src/app/api/auth/register/route.ts << 'ENDOFFILE'
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, source } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with source tracking
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: role || 'ACTOR',
        source: source || 'direct',
      },
    });

    // Create empty profile
    await prisma.profile.create({
      data: {
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      userId: user.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
ENDOFFILE

echo "✅ Register API updated"

# ============================================
# Step 3: Update existing /apply page to include source
# ============================================
echo "📝 Updating /apply page with source tracking..."

# Use Python for more reliable string replacement
python3 << 'PYEOF'
import re

try:
    with open('src/app/apply/page.tsx', 'r') as f:
        content = f.read()
    
    # Replace the body line to add source
    old_pattern = r"body: JSON\.stringify\(\{ email, password, name, role: 'ACTOR' \}\)"
    new_value = "body: JSON.stringify({ email, password, name, role: 'ACTOR', source: 'apply' })"
    
    if 'source:' not in content:
        content = re.sub(old_pattern, new_value, content)
        with open('src/app/apply/page.tsx', 'w') as f:
            f.write(content)
        print("   Updated /apply page")
    else:
        print("   /apply page already has source tracking")
except Exception as e:
    print(f"   Note: Could not update /apply page: {e}")
PYEOF

# ============================================
# Step 4: Create directories
# ============================================
mkdir -p src/app/apply-tyler-perry
mkdir -p src/app/apply-hunting-wives
mkdir -p src/app/apply-dune
mkdir -p src/app/api/admin/analytics/landing-pages

echo "📁 Directories created"

# ============================================
# Step 5: Tyler Perry "Tis So Sweet" Page
# ============================================
cat > src/app/apply-tyler-perry/page.tsx << 'ENDOFFILE'
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
  const castingEmail = 'DestinationCastingExtras@gmail.com';
  const castingTitle = 'Tyler Perry\'s "Tis So Sweet"';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: 'ACTOR', source: 'tyler-perry' }),
      });

      if (res.ok) {
        trackCompleteRegistration();
        const result = await signIn('credentials', { email, password, redirect: false });
        if (result?.ok) {
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
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Link href="/"><div className="text-3xl font-bold text-white inline-block">Casting Companion</div></Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse">🔴 NOW CASTING • NETFLIX</div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">TYLER PERRY'S "TIS SO SWEET"</h1>
            <p className="text-xl md:text-2xl text-gray-300">New roles available • Apply in seconds</p>
          </div>
          <div className="mb-8">
            <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden border-4 border-red-500 shadow-2xl">
              <video className="w-full h-full object-cover" autoPlay loop playsInline controls preload="auto" poster="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800">
                <source src="https://storage.googleapis.com/msgsndr/e9HzxNWnJSWGniDtfueu/media/68e9184635e869cb9b194fd2.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="text-center space-y-4 mb-16">
            <Button onClick={scrollToRegister} size="lg" className="w-full md:w-auto text-xl px-12 py-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all">
              <Zap className="mr-2 h-6 w-6" />Create Your Casting Profile Now
            </Button>
            <div><button onClick={() => setShowManualModal(true)} className="text-gray-400 hover:text-gray-300 text-sm underline">No thanks, I want to submit myself manually</button></div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Why actors choose CastingCompanion</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center"><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"><Check className="h-6 w-6 text-white" /></div><h3 className="text-white font-semibold mb-2">Auto-Submit</h3><p className="text-gray-300 text-sm">We automatically submit you to matching roles 24/7</p></div>
              <div className="text-center"><div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3"><Check className="h-6 w-6 text-white" /></div><h3 className="text-white font-semibold mb-2">Save Time</h3><p className="text-gray-300 text-sm">Never manually search casting boards again</p></div>
              <div className="text-center"><div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3"><Check className="h-6 w-6 text-white" /></div><h3 className="text-white font-semibold mb-2">Never Miss</h3><p className="text-gray-300 text-sm">Get instant notifications for new opportunities</p></div>
            </div>
          </div>
          <div className="text-center mb-8"><p className="text-2xl md:text-3xl font-bold text-white">Join <span className="text-red-400">1,247 actors</span> already booked through Casting Companion</p></div>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Hear from actors who landed roles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-xl"><div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />))}</div><p className="text-gray-700 text-sm mb-4 italic">"I landed 3 auditions in my first week! The auto-submit feature is a game-changer."</p><div className="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Sarah M." className="w-12 h-12 rounded-full object-cover" /><div><div className="font-semibold text-gray-900">Sarah M.</div><div className="text-xs text-gray-500">Los Angeles, CA</div></div></div></div>
              <div className="bg-white rounded-xl p-6 shadow-xl"><div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />))}</div><p className="text-gray-700 text-sm mb-4 italic">"Finally booked a speaking role on a Netflix series! CastingCompanion matched me to opportunities I never would have found."</p><div className="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Marcus T." className="w-12 h-12 rounded-full object-cover" /><div><div className="font-semibold text-gray-900">Marcus T.</div><div className="text-xs text-gray-500">New York, NY</div></div></div></div>
              <div className="bg-white rounded-xl p-6 shadow-xl"><div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />))}</div><p className="text-gray-700 text-sm mb-4 italic">"Got my first co-star role within 2 weeks of signing up. Way better than scrolling Backstage!"</p><div className="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" alt="Jessica L." className="w-12 h-12 rounded-full object-cover" /><div><div className="font-semibold text-gray-900">Jessica L.</div><div className="text-xs text-gray-500">Atlanta, GA</div></div></div></div>
            </div>
          </div>
          <div className="text-center mb-16"><div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 inline-block"><div className="flex items-center gap-3 justify-center"><TrendingUp className="h-8 w-8 text-green-400" /><p className="text-2xl md:text-3xl font-bold text-white">Actors using our service get <span className="text-green-400">3x more auditions</span></p></div></div></div>
          <div id="register" className="bg-white rounded-xl shadow-2xl p-8 md:p-12 scroll-mt-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Tyler Perry Application</h2><p className="text-gray-600 text-lg">Create your actor profile and get submitted to "Tis So Sweet" PLUS dozens of other matching roles automatically</p></div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span className="text-sm">{error}</span></div>}
                <div><Label htmlFor="name">Full Name *</Label><Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="h-12" /></div>
                <div><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-12" /></div>
                <div><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} className="h-12" /><p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p></div>
                <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">{loading ? 'Creating Profile...' : 'Create My Profile'}</Button>
                <p className="text-xs text-center text-gray-500">By signing up, you agree to our Terms of Service and Privacy Policy</p>
              </form>
              <div className="mt-6 pt-6 border-t text-center"><p className="text-sm text-gray-600">Already have an account? <Link href="/auth/login" className="text-red-600 font-semibold hover:underline">Log in</Link></p></div>
            </div>
          </div>
          <div className="mt-12 text-center"><p className="text-gray-400 text-sm mb-4">Trusted by actors landing roles at</p><div className="flex justify-center items-center gap-8 opacity-60"><img src="https://cdn.worldvectorlogo.com/logos/netflix-3.svg" alt="Netflix" className="h-8 w-auto" /><img src="https://cdn.worldvectorlogo.com/logos/hbo-4.svg" alt="HBO" className="h-7 w-auto" /><img src="https://cdn.worldvectorlogo.com/logos/disney--1.svg" alt="Disney" className="h-10 w-auto" /></div></div>
        </div>
      </div>
      <footer className="border-t border-white/10 mt-20 py-8"><div className="container mx-auto px-4 text-center text-gray-400 text-sm"><p>&copy; 2025 Casting Companion. All rights reserved.</p></div></footer>
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Submit Manually</DialogTitle><DialogDescription>You can email the casting director directly</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-start gap-3"><Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" /><div className="min-w-0"><p className="font-semibold text-blue-900 mb-1">Casting Director Email:</p><a href={`mailto:${castingEmail}?subject=Application for ${castingTitle}`} className="text-blue-600 hover:text-blue-800 underline break-all text-sm">{castingEmail}</a></div></div></div>
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4"><p className="text-sm font-semibold text-gray-900 mb-2">Want this done professionally?</p><p className="text-sm text-gray-600 mb-4">With Casting Companion, your submissions are formatted professionally and sent automatically.</p><Button onClick={() => { setShowManualModal(false); scrollToRegister(); }} className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700" size="sm">Sign Up for Professional Submissions</Button></div>
            <Button variant="outline" onClick={() => setShowManualModal(false)} className="w-full">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplyTylerPerryPage() {
  return (<Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}><ApplyPageContent /></Suspense>);
}
ENDOFFILE

echo "✅ Tyler Perry page created"

# ============================================
# Step 6: Hunting Wives Season 2 Page  
# ============================================
cat > src/app/apply-hunting-wives/page.tsx << 'ENDOFFILE'
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
  const castingEmail = 'THW2Casting@gmail.com';
  const castingTitle = 'Hunting Wives Season 2';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: 'ACTOR', source: 'hunting-wives' }),
      });

      if (res.ok) {
        trackCompleteRegistration();
        const result = await signIn('credentials', { email, password, redirect: false });
        if (result?.ok) {
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
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Link href="/"><div className="text-3xl font-bold text-white inline-block">Casting Companion</div></Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse">🔴 NOW CASTING • SEASON 2</div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">HUNTING WIVES SEASON 2</h1>
            <p className="text-xl md:text-2xl text-gray-300">New roles available • Apply in seconds</p>
          </div>
          <div className="mb-8">
            <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden border-4 border-emerald-500 shadow-2xl">
              <video className="w-full h-full object-cover" autoPlay loop playsInline controls preload="auto" poster="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800">
                <source src="https://storage.googleapis.com/msgsndr/e9HzxNWnJSWGniDtfueu/media/68e9184635e869cb9b194fd2.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="text-center space-y-4 mb-16">
            <Button onClick={scrollToRegister} size="lg" className="w-full md:w-auto text-xl px-12 py-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all">
              <Zap className="mr-2 h-6 w-6" />Create Your Casting Profile Now
            </Button>
            <div><button onClick={() => setShowManualModal(true)} className="text-gray-400 hover:text-gray-300 text-sm underline">No thanks, I want to submit myself manually</button></div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Why actors choose CastingCompanion</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center"><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"><Check className="h-6 w-6 text-white" /></div><h3 className="text-white font-semibold mb-2">Auto-Submit</h3><p className="text-gray-300 text-sm">We automatically submit you to matching roles 24/7</p></div>
              <div className="text-center"><div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3"><Check className="h-6 w-6 text-white" /></div><h3 className="text-white font-semibold mb-2">Save Time</h3><p className="text-gray-300 text-sm">Never manually search casting boards again</p></div>
              <div className="text-center"><div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3"><Check className="h-6 w-6 text-white" /></div><h3 className="text-white font-semibold mb-2">Never Miss</h3><p className="text-gray-300 text-sm">Get instant notifications for new opportunities</p></div>
            </div>
          </div>
          <div className="text-center mb-8"><p className="text-2xl md:text-3xl font-bold text-white">Join <span className="text-emerald-400">1,247 actors</span> already booked through Casting Companion</p></div>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Hear from actors who landed roles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-xl"><div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />))}</div><p className="text-gray-700 text-sm mb-4 italic">"I landed 3 auditions in my first week! The auto-submit feature is a game-changer."</p><div className="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Sarah M." className="w-12 h-12 rounded-full object-cover" /><div><div className="font-semibold text-gray-900">Sarah M.</div><div className="text-xs text-gray-500">Los Angeles, CA</div></div></div></div>
              <div className="bg-white rounded-xl p-6 shadow-xl"><div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />))}</div><p className="text-gray-700 text-sm mb-4 italic">"Finally booked a speaking role on a Netflix series! CastingCompanion matched me to opportunities I never would have found."</p><div className="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Marcus T." className="w-12 h-12 rounded-full object-cover" /><div><div className="font-semibold text-gray-900">Marcus T.</div><div className="text-xs text-gray-500">New York, NY</div></div></div></div>
              <div className="bg-white rounded-xl p-6 shadow-xl"><div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />))}</div><p className="text-gray-700 text-sm mb-4 italic">"Got my first co-star role within 2 weeks of signing up. Way better than scrolling Backstage!"</p><div className="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" alt="Jessica L." className="w-12 h-12 rounded-full object-cover" /><div><div className="font-semibold text-gray-900">Jessica L.</div><div className="text-xs text-gray-500">Atlanta, GA</div></div></div></div>
            </div>
          </div>
          <div className="text-center mb-16"><div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 inline-block"><div className="flex items-center gap-3 justify-center"><TrendingUp className="h-8 w-8 text-green-400" /><p className="text-2xl md:text-3xl font-bold text-white">Actors using our service get <span className="text-green-400">3x more auditions</span></p></div></div></div>
          <div id="register" className="bg-white rounded-xl shadow-2xl p-8 md:p-12 scroll-mt-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8"><h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Hunting Wives Application</h2><p className="text-gray-600 text-lg">Create your actor profile and get submitted to Hunting Wives Season 2 PLUS dozens of other matching roles automatically</p></div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span className="text-sm">{error}</span></div>}
                <div><Label htmlFor="name">Full Name *</Label><Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="h-12" /></div>
                <div><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-12" /></div>
                <div><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} className="h-12" /><p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p></div>
                <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">{loading ? 'Creating Profile...' : 'Create My Profile'}</Button>
                <p className="text-xs text-center text-gray-500">By signing up, you agree to our Terms of Service and Privacy Policy</p>
              </form>
              <div className="mt-6 pt-6 border-t text-center"><p className="text-sm text-gray-600">Already have an account? <Link href="/auth/login" className="text-emerald-600 font-semibold hover:underline">Log in</Link></p></div>
            </div>
          </div>
          <div className="mt-12 text-center"><p className="text-gray-400 text-sm mb-4">Trusted by actors landing roles at</p><div className="flex justify-center items-center gap-8 opacity-60"><img src="https://cdn.worldvectorlogo.com/logos/netflix-3.svg" alt="Netflix" className="h-8 w-auto" /><img src="https://cdn.worldvectorlogo.com/logos/hbo-4.svg" alt="HBO" className="h-7 w-auto" /><img src="https://cdn.worldvectorlogo.com/logos/disney--1.svg" alt="Disney" className="h-10 w-auto" /></div></div>
        </div>
      </div>
      <footer className="border-t border-white/10 mt-20 py-8"><div className="container mx-auto px-4 text-center text-gray-400 text-sm"><p>&copy; 2025 Casting Companion. All rights reserved.</p></div></footer>
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Submit Manually</DialogTitle><DialogDescription>You can email the casting director directly</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-start gap-3"><Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" /><div className="min-w-0"><p className="font-semibold text-blue-900 mb-1">Casting Director Email:</p><a href={`mailto:${castingEmail}?subject=Application for ${castingTitle}`} className="text-blue-600 hover:text-blue-800 underline break-all text-sm">{castingEmail}</a></div></div></div>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4"><p className="text-sm font-semibold text-gray-900 mb-2">Want this done professionally?</p><p className="text-sm text-gray-600 mb-4">With Casting Companion, your submissions are formatted professionally and sent automatically.</p><Button onClick={() => { setShowManualModal(false); scrollToRegister(); }} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" size="sm">Sign Up for Professional Submissions</Button></div>
            <Button variant="outline" onClick={() => setShowManualModal(false)} className="w-full">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplyHuntingWivesPage() {
  return (<Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}><ApplyPageContent /></Suspense>);
}
ENDOFFILE

echo "✅ Hunting Wives page created"

# ============================================
# Step 7: Dune 3 Page (Desert Themed)
# ============================================
cat > src/app/apply-dune/page.tsx << 'ENDOFFILE'
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
  const castingEmail = 'info@francinemaislercasting.com';
  const castingTitle = 'Dune 3';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: 'ACTOR', source: 'dune' }),
      });

      if (res.ok) {
        trackCompleteRegistration();
        const result = await signIn('credentials', { email, password, redirect: false });
        if (result?.ok) {
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
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950 to-stone-900">
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}} />
      <div className="container mx-auto px-4 py-12 relative">
        <div className="text-center mb-8">
          <Link href="/"><div className="text-3xl font-bold text-amber-100 inline-block">Casting Companion</div></Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block bg-amber-700/80 text-amber-100 px-6 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse border border-amber-500/50">🔴 NOW CASTING • LEGENDARY PICTURES</div>
            <h1 className="text-4xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 mb-4 tracking-wider" style={{fontFamily: 'serif', letterSpacing: '0.15em'}}>DUNE: PART THREE</h1>
            <p className="text-xl md:text-2xl text-amber-200/80">New roles available • Apply in seconds</p>
          </div>
          <div className="mb-8">
            <div className="aspect-video bg-stone-900 rounded-xl overflow-hidden border-4 border-amber-600/60 shadow-2xl" style={{boxShadow: '0 0 60px rgba(217, 119, 6, 0.3)'}}>
              <video className="w-full h-full object-cover" autoPlay loop playsInline controls preload="auto" poster="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800">
                <source src="https://storage.googleapis.com/msgsndr/e9HzxNWnJSWGniDtfueu/media/68e9184635e869cb9b194fd2.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="text-center space-y-4 mb-16">
            <Button onClick={scrollToRegister} size="lg" className="w-full md:w-auto text-xl px-12 py-8 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all border border-amber-400/30" style={{boxShadow: '0 0 40px rgba(217, 119, 6, 0.4)'}}>
              <Zap className="mr-2 h-6 w-6" />Create Your Casting Profile Now
            </Button>
            <div><button onClick={() => setShowManualModal(true)} className="text-amber-400/70 hover:text-amber-300 text-sm underline">No thanks, I want to submit myself manually</button></div>
          </div>
          <div className="bg-stone-900/60 backdrop-blur-lg rounded-xl p-8 mb-8 border border-amber-700/30">
            <h2 className="text-2xl font-bold text-amber-100 text-center mb-6">Why actors choose CastingCompanion</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center"><div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3" style={{boxShadow: '0 0 20px rgba(217, 119, 6, 0.5)'}}><Check className="h-6 w-6 text-white" /></div><h3 className="text-amber-100 font-semibold mb-2">Auto-Submit</h3><p className="text-amber-200/70 text-sm">We automatically submit you to matching roles 24/7</p></div>
              <div className="text-center"><div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3" style={{boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)'}}><Check className="h-6 w-6 text-white" /></div><h3 className="text-amber-100 font-semibold mb-2">Save Time</h3><p className="text-amber-200/70 text-sm">Never manually search casting boards again</p></div>
              <div className="text-center"><div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3" style={{boxShadow: '0 0 20px rgba(202, 138, 4, 0.5)'}}><Check className="h-6 w-6 text-white" /></div><h3 className="text-amber-100 font-semibold mb-2">Never Miss</h3><p className="text-amber-200/70 text-sm">Get instant notifications for new opportunities</p></div>
            </div>
          </div>
          <div className="text-center mb-8"><p className="text-2xl md:text-3xl font-bold text-amber-100">Join <span className="text-amber-400">1,247 actors</span> already booked through Casting Companion</p></div>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-amber-100 text-center mb-8">Hear from actors who landed roles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-stone-100 rounded-xl p-6 shadow-xl"><div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />))}</div><p className="text-gray-700 text-sm mb-4 italic">"I landed 3 auditions in my first week! The auto-submit feature is a game-changer."</p><div className="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Sarah M." className="w-12 h-12 rounded-full object-cover" /><div><div className="font-semibold text-gray-900">Sarah M.</div><div className="text-xs text-gray-500">Los Angeles, CA</div></div></div></div>
              <div className="bg-stone-100 rounded-xl p-6 shadow-xl"><div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />))}</div><p className="text-gray-700 text-sm mb-4 italic">"Finally booked a speaking role on a Netflix series! CastingCompanion matched me to opportunities I never would have found."</p><div className="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Marcus T." className="w-12 h-12 rounded-full object-cover" /><div><div className="font-semibold text-gray-900">Marcus T.</div><div className="text-xs text-gray-500">New York, NY</div></div></div></div>
              <div className="bg-stone-100 rounded-xl p-6 shadow-xl"><div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />))}</div><p className="text-gray-700 text-sm mb-4 italic">"Got my first co-star role within 2 weeks of signing up. Way better than scrolling Backstage!"</p><div className="flex items-center gap-3"><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" alt="Jessica L." className="w-12 h-12 rounded-full object-cover" /><div><div className="font-semibold text-gray-900">Jessica L.</div><div className="text-xs text-gray-500">Atlanta, GA</div></div></div></div>
            </div>
          </div>
          <div className="text-center mb-16"><div className="bg-stone-900/60 backdrop-blur-lg rounded-xl p-6 inline-block border border-amber-700/30"><div className="flex items-center gap-3 justify-center"><TrendingUp className="h-8 w-8 text-amber-400" /><p className="text-2xl md:text-3xl font-bold text-amber-100">Actors using our service get <span className="text-amber-400">3x more auditions</span></p></div></div></div>
          <div id="register" className="bg-stone-100 rounded-xl shadow-2xl p-8 md:p-12 scroll-mt-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8"><h2 className="text-3xl font-bold text-stone-900 mb-2">Complete Your Dune 3 Application</h2><p className="text-stone-600 text-lg">Create your actor profile and get submitted to Dune 3 PLUS dozens of other matching roles automatically</p></div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span className="text-sm">{error}</span></div>}
                <div><Label htmlFor="name">Full Name *</Label><Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="h-12" /></div>
                <div><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-12" /></div>
                <div><Label htmlFor="password">Password *</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} className="h-12" /><p className="text-xs text-stone-500 mt-1">Must be at least 8 characters</p></div>
                <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 border border-amber-400/30">{loading ? 'Creating Profile...' : 'Create My Profile'}</Button>
                <p className="text-xs text-center text-stone-500">By signing up, you agree to our Terms of Service and Privacy Policy</p>
              </form>
              <div className="mt-6 pt-6 border-t text-center"><p className="text-sm text-stone-600">Already have an account? <Link href="/auth/login" className="text-amber-700 font-semibold hover:underline">Log in</Link></p></div>
            </div>
          </div>
          <div className="mt-12 text-center"><p className="text-amber-300/60 text-sm mb-4">Trusted by actors landing roles at</p><div className="flex justify-center items-center gap-8 opacity-60"><img src="https://cdn.worldvectorlogo.com/logos/netflix-3.svg" alt="Netflix" className="h-8 w-auto" /><img src="https://cdn.worldvectorlogo.com/logos/hbo-4.svg" alt="HBO" className="h-7 w-auto" /><img src="https://cdn.worldvectorlogo.com/logos/disney--1.svg" alt="Disney" className="h-10 w-auto" /></div></div>
        </div>
      </div>
      <footer className="border-t border-amber-700/20 mt-20 py-8 relative"><div className="container mx-auto px-4 text-center text-amber-300/60 text-sm"><p>&copy; 2025 Casting Companion. All rights reserved.</p></div></footer>
      <Dialog open={showManualModal} onOpenChange={setShowManualModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Submit Manually</DialogTitle><DialogDescription>You can email the casting director directly</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><div className="flex items-start gap-3"><Mail className="h-5 w-5 text-amber-700 mt-0.5 flex-shrink-0" /><div className="min-w-0"><p className="font-semibold text-amber-900 mb-1">Casting Director Email:</p><a href={`mailto:${castingEmail}?subject=Application for ${castingTitle}`} className="text-amber-700 hover:text-amber-800 underline break-all text-sm">{castingEmail}</a></div></div></div>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4"><p className="text-sm font-semibold text-gray-900 mb-2">Want this done professionally?</p><p className="text-sm text-gray-600 mb-4">With Casting Companion, your submissions are formatted professionally and sent automatically.</p><Button onClick={() => { setShowManualModal(false); scrollToRegister(); }} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700" size="sm">Sign Up for Professional Submissions</Button></div>
            <Button variant="outline" onClick={() => setShowManualModal(false)} className="w-full">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplyDunePage() {
  return (<Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950 to-stone-900 flex items-center justify-center"><div className="text-amber-100">Loading...</div></div>}><ApplyPageContent /></Suspense>);
}
ENDOFFILE

echo "✅ Dune 3 page created"

# ============================================
# Step 8: Create Landing Page Stats Component
# ============================================
cat > src/app/admin/analytics/LandingPageStats.tsx << 'ENDOFFILE'
'use client';

interface LandingPageData {
  source: string;
  registrations: number;
  trials: number;
  paid: number;
  trialRate: string;
  paidRate: string;
}

interface Props {
  data: LandingPageData[];
}

const sourceLabels: Record<string, string> = {
  'apply': 'Euphoria (/apply)',
  'tyler-perry': 'Tyler Perry (/apply-tyler-perry)',
  'hunting-wives': 'Hunting Wives (/apply-hunting-wives)',
  'dune': 'Dune 3 (/apply-dune)',
  'direct': 'Direct / Other',
};

const sourceColors: Record<string, string> = {
  'apply': 'bg-purple-500',
  'tyler-perry': 'bg-red-500',
  'hunting-wives': 'bg-emerald-500',
  'dune': 'bg-amber-500',
  'direct': 'bg-gray-500',
};

export default function LandingPageStats({ data }: Props) {
  const totalRegistrations = data.reduce((sum, d) => sum + d.registrations, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">📊 Landing Page Performance</h2>
      
      <div className="mb-6">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {data.map((item) => {
            const percentage = totalRegistrations > 0 ? (item.registrations / totalRegistrations) * 100 : 0;
            if (percentage === 0) return null;
            return (
              <div key={item.source} className={`${sourceColors[item.source] || 'bg-gray-400'} flex items-center justify-center text-white text-xs font-medium`} style={{ width: `${percentage}%` }} title={`${sourceLabels[item.source] || item.source}: ${item.registrations} (${percentage.toFixed(1)}%)`}>
                {percentage > 10 && `${percentage.toFixed(0)}%`}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-2">
          {data.map((item) => (
            <div key={item.source} className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded ${sourceColors[item.source] || 'bg-gray-400'}`}></div>
              <span className="text-gray-600">{sourceLabels[item.source] || item.source}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-semibold">Landing Page</th>
              <th className="text-center py-2 px-3 font-semibold">Registrations</th>
              <th className="text-center py-2 px-3 font-semibold">Trials Started</th>
              <th className="text-center py-2 px-3 font-semibold">Trial Rate</th>
              <th className="text-center py-2 px-3 font-semibold">Paid Customers</th>
              <th className="text-center py-2 px-3 font-semibold">Paid Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.source} className="border-b hover:bg-gray-50">
                <td className="py-3 px-3"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded ${sourceColors[item.source] || 'bg-gray-400'}`}></div><span className="font-medium">{sourceLabels[item.source] || item.source}</span></div></td>
                <td className="text-center py-3 px-3 font-semibold">{item.registrations}</td>
                <td className="text-center py-3 px-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{item.trials}</span></td>
                <td className="text-center py-3 px-3"><span className={`px-2 py-1 rounded text-xs font-medium ${parseFloat(item.trialRate) >= 50 ? 'bg-green-100 text-green-800' : parseFloat(item.trialRate) >= 25 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{item.trialRate}</span></td>
                <td className="text-center py-3 px-3"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">{item.paid}</span></td>
                <td className="text-center py-3 px-3"><span className={`px-2 py-1 rounded text-xs font-medium ${parseFloat(item.paidRate) >= 10 ? 'bg-green-100 text-green-800' : parseFloat(item.paidRate) >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{item.paidRate}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="py-3 px-3">Total</td>
              <td className="text-center py-3 px-3">{data.reduce((s, d) => s + d.registrations, 0)}</td>
              <td className="text-center py-3 px-3">{data.reduce((s, d) => s + d.trials, 0)}</td>
              <td className="text-center py-3 px-3">-</td>
              <td className="text-center py-3 px-3">{data.reduce((s, d) => s + d.paid, 0)}</td>
              <td className="text-center py-3 px-3">-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
ENDOFFILE

echo "✅ Landing page stats component created"

# ============================================
# Step 9: Create Landing Page Section (fetches data)
# ============================================
cat > src/app/admin/analytics/LandingPageSection.tsx << 'ENDOFFILE'
'use client';

import { useEffect, useState } from 'react';
import LandingPageStats from './LandingPageStats';

interface LandingPageData {
  source: string;
  registrations: number;
  trials: number;
  paid: number;
  trialRate: string;
  paidRate: string;
}

interface Props {
  fromDate: string;
  toDate: string;
}

export default function LandingPageSection({ fromDate, toDate }: Props) {
  const [data, setData] = useState<LandingPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/analytics/landing-pages?from=${fromDate}&to=${toDate}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data || []);
        } else {
          setError('Failed to load landing page data');
        }
      } catch (err) {
        setError('Failed to load landing page data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fromDate, toDate]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">📊 Landing Page Performance</h2>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">📊 Landing Page Performance</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">📊 Landing Page Performance</h2>
        <p className="text-gray-500">No landing page data available for this date range.</p>
        <p className="text-sm text-gray-400 mt-2">Note: Landing page tracking was just added. New registrations will be tracked going forward.</p>
      </div>
    );
  }

  return <LandingPageStats data={data} />;
}
ENDOFFILE

echo "✅ Landing page section component created"

# ============================================
# Step 10: Create Analytics API endpoint
# ============================================
cat > src/app/api/admin/analytics/landing-pages/route.ts << 'ENDOFFILE'
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || '2025-10-28';
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

    const fromDate = new Date(from + 'T00:00:00Z');
    const toDate = new Date(to + 'T23:59:59Z');

    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        role: 'ACTOR',
      },
      select: {
        source: true,
        subscriptionStatus: true,
      },
    });

    const sourceMap: Record<string, { registrations: number; trials: number; paid: number }> = {};

    for (const user of users) {
      const source = user.source || 'direct';
      if (!sourceMap[source]) {
        sourceMap[source] = { registrations: 0, trials: 0, paid: 0 };
      }
      sourceMap[source].registrations++;
      const status = user.subscriptionStatus?.toLowerCase();
      if (status === 'trialing' || status === 'trial' || status === 'active') {
        sourceMap[source].trials++;
      }
      if (status === 'active') {
        sourceMap[source].paid++;
      }
    }

    const data = Object.entries(sourceMap).map(([source, stats]) => ({
      source,
      registrations: stats.registrations,
      trials: stats.trials,
      paid: stats.paid,
      trialRate: stats.registrations > 0 ? ((stats.trials / stats.registrations) * 100).toFixed(1) + '%' : '0%',
      paidRate: stats.registrations > 0 ? ((stats.paid / stats.registrations) * 100).toFixed(1) + '%' : '0%',
    }));

    data.sort((a, b) => b.registrations - a.registrations);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Landing page analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
ENDOFFILE

echo "✅ Landing page analytics API created"

# ============================================
# Step 11: Push database changes
# ============================================
echo ""
echo "🗄️  Pushing database schema changes..."
npx prisma db push

# ============================================
# Step 12: Git commit and push
# ============================================
echo ""
echo "📦 Adding files to git..."
git add -A

echo "💾 Committing changes..."
git commit -m "Add Tyler Perry, Hunting Wives, Dune apply pages with analytics tracking"

echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "============================================"
echo "✅ All done! Your new pages are live:"
echo ""
echo "  • https://castingcompanion.com/apply-tyler-perry"
echo "  • https://castingcompanion.com/apply-hunting-wives"
echo "  • https://castingcompanion.com/apply-dune"
echo ""
echo "📊 Landing page tracking is set up!"
echo ""
echo "⚠️  To see the stats in your dashboard, add this to"
echo "   your AnalyticsDashboard.tsx after the date filters:"
echo ""
echo '   import LandingPageSection from "./LandingPageSection";'
echo ""
echo '   <LandingPageSection fromDate={fromDate} toDate={toDate} />'
echo ""
echo "============================================"
