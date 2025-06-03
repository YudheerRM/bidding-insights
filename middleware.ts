import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in') || 
                      req.nextUrl.pathname.startsWith('/sign-up');
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');

    // Allow API auth routes
    if (isApiAuth) {
      return NextResponse.next();
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Redirect unauthenticated users to sign-in
    if (isDashboard && !isAuth) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Check user type permissions for specific routes
    if (isAuth && token) {
      const userType = token.userType as string;
      const pathname = req.nextUrl.pathname;

      // Admin-only routes
      if (pathname.startsWith('/dashboard/admin') && userType !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Government official routes
      if (pathname.startsWith('/dashboard/manage') && 
          !['admin', 'government_official'].includes(userType)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Bidder-specific routes
      if (pathname.startsWith('/dashboard/bids') && 
          !['admin', 'bidder'].includes(userType)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always allow access to auth pages and API routes
        if (req.nextUrl.pathname.startsWith('/sign-in') || 
            req.nextUrl.pathname.startsWith('/sign-up') ||
            req.nextUrl.pathname.startsWith('/api/auth')) {
          return true;
        }
        
        // Require auth for dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }
        
        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sign-in',
    '/sign-up',
    '/api/auth/:path*'
  ]
};
