// src/proxy.ts

import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

// Public routes
const publicRoutes = ['/auth/login', '/auth/register', '/auth/error', '/health'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ❌ AUTH DISABLED TEMPORARILY (for development)
  // const session = await auth();

  // // Redirect unauthenticated users
  // if (!session) {
  //   return NextResponse.redirect(new URL('/auth/login', request.url));
  // }

  // // Admin route protection
  // if (pathname.startsWith('/admin')) {
  //   if (session.user?.role !== 'admin') {
  //     return NextResponse.redirect(
  //       new URL('/auth/error?error=unauthorized', request.url)
  //     );
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
