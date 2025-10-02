import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/auth',
  ];

  // Onboarding routes
  const onboardingRoutes = [
    '/onboarding/step1',
    '/onboarding/step2',
    '/onboarding/step3',
    '/onboarding/step4',
    '/onboarding/payment',
    '/onboarding/success',
  ];

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Check if user has completed onboarding
  const user = session.user as any;
  
  // Allow access to onboarding routes
  if (onboardingRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirect to onboarding if not complete
  if (!user.onboardingComplete) {
    return NextResponse.redirect(new URL('/onboarding/step1', request.url));
  }

  // Admin routes
  if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/stripe/webhook|_next/static|_next/image|favicon.ico|public).*)'],
};
