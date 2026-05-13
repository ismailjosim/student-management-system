import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/auth/error', '/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const session = await auth();

  // If not authenticated and trying to access protected route, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based access control for admin routes
  if (pathname.startsWith('/admin')) {
    if (session.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/error?error=unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except:
    // - _next/static
    // - _next/image
    // - favicon.ico
    // - public files
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
