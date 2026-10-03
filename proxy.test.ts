import { describe, expect, it } from 'vitest'
import { proxy } from './proxy'

// RF-14 · the route guard. It reads only two things: the address and whether the session
// cookie exists. The redirect is what is under test, not the page behind it.

// A NextRequest reduced to what proxy actually reads
function request(pathname: string, signedIn: boolean) {
  const url = `http://localhost${pathname}`
  return {
    nextUrl: new URL(url),
    url,
    cookies: { has: () => signedIn },
  } as unknown as Parameters<typeof proxy>[0]
}

const location = (response: Response) => response.headers.get('location')

describe('proxy', () => {
  it('sends a signed-out visitor to the login', () => {
    expect(location(proxy(request('/cases', false)))).toBe(
      'http://localhost/login',
    )
  })

  it('sends a signed-in visitor away from the login', () => {
    expect(location(proxy(request('/login', true)))).toBe(
      'http://localhost/cases',
    )
  })

  it('sends the root to /cases when signed in and to /login when not', () => {
    expect(location(proxy(request('/', true)))).toBe('http://localhost/cases')
    expect(location(proxy(request('/', false)))).toBe('http://localhost/login')
  })

  it('lets a signed-in visitor into a private page', () => {
    expect(location(proxy(request('/cases/c1', true)))).toBeNull()
  })

  it('lets a signed-out visitor reach the login', () => {
    expect(location(proxy(request('/login', false)))).toBeNull()
  })
})
