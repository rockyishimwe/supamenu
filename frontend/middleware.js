import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('dineflow_token');
  const role = request.cookies.get('dineflow_role')?.value;
  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password'
  ) {
    return NextResponse.next();
  }

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role mismatch → redirect to correct portal
  if (pathname.startsWith('/customer') && role !== 'customer') {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }
  if (pathname.startsWith('/staff') && role !== 'staff') {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }
  if (pathname.startsWith('/owner') && role !== 'owner') {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/customer/:path*', '/staff/:path*', '/owner/:path*'],
};
