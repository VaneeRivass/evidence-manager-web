import { type NextRequest, NextResponse } from 'next/server'

// RF-14 · the route guard: it runs on Next's server before any page is sent. It only sees
// whether the cookie exists; the API checks that it is valid, on every request.

const SESSION_COOKIE = 'session' // the API's name for it (src/modules/auth/session.ts)

// What is public is listed, so a page added later is private by default
const PUBLIC_PAGES = ['/login', '/register']

const EXPIRED_MARKER = 'expirada'

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const signedIn = request.cookies.has(SESSION_COOKIE)
  const isPublic = PUBLIC_PAGES.includes(pathname)
  // A session the API rejected: the cookie may still be present, so without this the guard
  // would bounce /login back to /cases for ever. The marker lets that one login through.
  const sessionExpired =
    pathname === '/login' && searchParams.has(EXPIRED_MARKER)
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, request.url))

  if (pathname === '/') return redirectTo(signedIn ? '/cases' : '/login')
  if (isPublic && signedIn && !sessionExpired) return redirectTo('/cases')
  if (!isPublic && !signedIn) return redirectTo('/login')
  return NextResponse.next()
}

export const config = {
  // Everything except the API rewrite and Next's own files. `api/` and `api$`, not `api`,
  // which would also let /apiary past the guard.
  matcher: ['/((?!api/|api$|_next/static|_next/image|favicon.ico).*)'],
}
