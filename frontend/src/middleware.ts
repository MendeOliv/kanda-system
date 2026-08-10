import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Combined middleware: i18n (next-intl) + Firebase auth guard.
 *
 * Auth logic:
 * - Reads `firebaseToken` cookie
 * - Redirects unauthenticated users to /login (except when already on /login)
 * - Redirects authenticated users away from /login to /
 * - Applied only to protected routes: /admin/*, /pedidos/*, /moradas/*, /login
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Next.js can emit locale-prefixed asset URLs when locale routing is enabled
  // (e.g. /pt-AO/_next/static/...). Those files actually live at /_next/static/.
  // Rewrite them to the real Next.js static asset path before next-intl sees them.
  const localeAssetMatch = pathname.match(/^\/(?:en|pt-AO)\/(_next\/.*)$/);
  if (localeAssetMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localeAssetMatch[1]}`;
    return NextResponse.rewrite(url);
  }

  // Never let i18n/auth middleware process Next.js internal assets.
  if (pathname.startsWith('/_next/') || pathname.startsWith('/_vercel/')) {
    return NextResponse.next();
  }

  // --- i18n middleware ---
  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  // --- Auth guard ---
  const token = request.cookies.get('firebaseToken')?.value;
  const isAuthPage = pathname.startsWith('/login');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
