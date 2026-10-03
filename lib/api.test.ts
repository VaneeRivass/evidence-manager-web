import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  api,
  http,
  isNetworkError,
  isNotFound,
  isUnauthenticated,
  toApiError,
} from './api'

// The one place that speaks HTTP: what it returns for a body, and how it names a failure.

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ApiError', () => {
  it('keeps the stable code, its parameters and the per-field errors', () => {
    const error = new ApiError('VALIDATION_ERROR', { min: 8 }, [
      { field: 'password', code: 'TOO_SHORT', params: { min: 8 } },
    ])

    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.params).toEqual({ min: 8 })
    expect(error.fieldErrors).toHaveLength(1)
  })

  it('carries the HTTP status and the request id, so support can trace it', () => {
    const error = new ApiError('INTERNAL_ERROR', {}, [], 500, 'req-42')

    expect(error.status).toBe(500)
    expect(error.requestId).toBe('req-42')
  })
})

describe('toApiError', () => {
  it('passes an ApiError through untouched', () => {
    const original = new ApiError('NETWORK_ERROR')

    expect(toApiError(original)).toBe(original)
  })

  it('wraps anything else as INTERNAL_ERROR, so every caller sees one shape', () => {
    expect(toApiError(new Error('boom')).code).toBe('INTERNAL_ERROR')
    expect(toApiError('nope').code).toBe('INTERNAL_ERROR')
  })
})

describe('the code helpers', () => {
  it('recognise the session, the network and the not-found codes', () => {
    expect(isUnauthenticated(new ApiError('UNAUTHENTICATED'))).toBe(true)
    expect(isNetworkError(new ApiError('NETWORK_ERROR'))).toBe(true)
    expect(isNotFound(new ApiError('CASE_NOT_FOUND'))).toBe(true)
    expect(isNotFound(new ApiError('CASE_FORBIDDEN'))).toBe(true)
  })

  it('say no to anything that is not one of those', () => {
    expect(isUnauthenticated(new ApiError('INTERNAL_ERROR'))).toBe(false)
    expect(isNetworkError(new Error('x'))).toBe(false)
    expect(isNotFound(new ApiError('INTERNAL_ERROR'))).toBe(false)
  })
})

describe('api', () => {
  it('returns the body, not the axios envelope, so no hook unwraps .data', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({
      data: { items: [], total: 0 },
    } as never)

    await expect(api.get('/cases')).resolves.toEqual({ items: [], total: 0 })
  })

  it('forwards the path and the config to the underlying client', async () => {
    const get = vi
      .spyOn(http, 'get')
      .mockResolvedValue({ data: { ok: true } } as never)

    await api.get('/cases', { params: { status: 'OPEN' } })

    expect(get).toHaveBeenCalledWith('/cases', { params: { status: 'OPEN' } })
  })

  // The adapter is the seam where the fake answer enters, so the real interceptor runs
  it('turns an API problem body into an ApiError with its code and status', async () => {
    await expect(
      api.get('/cases', {
        adapter: async () => {
          throw {
            response: {
              data: { code: 'CASE_NOT_FOUND', status: 404 },
              status: 404,
            },
          }
        },
      }),
    ).rejects.toMatchObject({ code: 'CASE_NOT_FOUND', status: 404 })
  })

  it('reads a rejection that never reached the API as NETWORK_ERROR', async () => {
    await expect(
      api.get('/cases', {
        adapter: async () => {
          throw new Error('down')
        },
      }),
    ).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
  })
})
