import { afterEach, describe, expect, it, vi } from 'vitest'
import { goToLogin } from './session'

// RF-04 · RF-14 · the way out of the application: a full load, so the client's cache goes too.

const assign = vi.fn()

afterEach(() => {
  vi.unstubAllGlobals()
  assign.mockReset()
})

describe('goToLogin', () => {
  it('does a full load to the login', () => {
    vi.stubGlobal('location', { assign })

    goToLogin()

    expect(assign).toHaveBeenCalledWith('/login')
  })

  it('marks the session as expired, so the guard lets the login through', () => {
    vi.stubGlobal('location', { assign })

    goToLogin(true)

    expect(assign).toHaveBeenCalledWith('/login?expirada=1')
  })
})
