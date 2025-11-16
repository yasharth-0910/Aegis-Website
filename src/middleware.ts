import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For now, just allow all requests
  // In production, you'd check for authentication here
  const isProfileRoute = request.nextUrl.pathname.startsWith('/profile');
  
  // You can add authentication logic here
  // For example, check for a session cookie or JWT token
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*'],
};