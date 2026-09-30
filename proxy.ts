import { type NextRequest, NextResponse } from 'next/server'

// RF-14 · the route guard. It runs on Next's server before any page is sent, so a person
// without a session never downloads a private page. Not a security boundary: the API
// checks the session on every request. See docs/requirements.md, RF-14.

// The API's cookie name (evidence-manager-api, src/modules/auth/session.ts)
const SESSION_COOKIE = 'session'

// What is public is listed, not what is private: a route added later is protected
// without anyone remembering to add it here.
const PUBLIC = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookie = request.cookies.get(SESSION_COOKIE)
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url))

  if (pathname === '/') return to(cookie ? '/cases' : '/login')

  if (!PUBLIC.includes(pathname))
    return cookie ? NextResponse.next() : to('/login')

  if (!cookie) return NextResponse.next()

  // A cookie on /login or /register: ask the API whether it still holds. Trusting it
  // blindly would loop — /cases sends a rejected cookie here, and this would send it
  // back. The page's JavaScript cannot delete an httpOnly cookie; this server can.
  const verdict = await askApi(cookie.value)
  if (verdict === 'valid') return to('/cases')

  const response = NextResponse.next()
  if (verdict === 'rejected') response.cookies.delete(SESSION_COOKIE)
  return response
}

// 'unknown' when the API cannot be reached: the form is served, but a session that may
// well be valid is not thrown away because of a moment's outage
async function askApi(
  token: string,
): Promise<'valid' | 'rejected' | 'unknown'> {
  try {
    const res = await fetch(`${process.env.API_URL}/auth/me`, {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
      cache: 'no-store',
    })
    if (res.ok) return 'valid'
    return res.status === 401 ? 'rejected' : 'unknown'
  } catch {
    return 'unknown'
  }
}

export const config = {
  // Everything except the API rewrite — signing in must reach it without a session —
  // and Next's own files. `api/` and `api$`, not `api`: that would also let /apiary or
  // /api-docs past the guard.
  matcher: ['/((?!api/|api$|_next/static|_next/image|favicon.ico).*)'],
}
