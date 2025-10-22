import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { trackAPITiming } from '@/lib/metrics';

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  // Clone the response to add timing
  const response = NextResponse.next();
  
  // Log timing after response
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
  
  // Track API timing for /api routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const endpoint = request.nextUrl.pathname.replace('/api/', '');
    const duration = Date.now() - startTime;
    
    // Track timing (this runs after the API responds)
    setTimeout(() => {
      trackAPITiming(endpoint, duration, response.status < 400);
    }, 0);
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
