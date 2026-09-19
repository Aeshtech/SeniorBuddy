import { NextRequest, NextResponse } from 'next/server';

/**
 * Security middleware — applies to ALL routes.
 * Sets Content-Security-Policy, X-Content-Type-Options, Referrer-Policy,
 * and validates Origin on mutating API requests (CSRF protection).
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ── Security Headers (OWASP recommended) ─────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://openrouter.ai",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // ── CSRF: Reject mutating API requests from foreign origins ──────────
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const method = request.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      // Allow same-origin and server-side (no origin header) requests
      if (origin && host && !origin.includes(host)) {
        return NextResponse.json(
          { error: 'Cross-origin requests are not permitted.' },
          { status: 403 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
