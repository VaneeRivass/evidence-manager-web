import axios, { type AxiosError } from 'axios'

// The only place in this application that makes HTTP requests. Hooks say what to request
// and when; how a request is made, and how an error is read, lives here.

export type Params = Record<string, string | number>

export type FieldError = { field: string; code: string; params?: Params }

// What this application reads from the API's error body: RFC 9457 plus a stable code
// and its parameters (RF-21, RF-23)
type ProblemDetails = {
  code: string
  params?: Params
  errors?: FieldError[]
}

export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly params: Params = {},
    readonly fieldErrors: FieldError[] = [],
  ) {
    super(code)
    this.name = 'ApiError'
  }
}

// Anything that is not an ApiError — a bug, a library throwing — reads as INTERNAL_ERROR,
// so every caller handles one shape
export const toApiError = (error: unknown): ApiError =>
  error instanceof ApiError ? error : new ApiError('INTERNAL_ERROR')

// The session is gone: expired, signed out elsewhere, or never valid
export const isUnauthenticated = (error: unknown): boolean =>
  error instanceof ApiError && error.code === 'UNAUTHENTICATED'

// Relative on purpose: the rewrite in next.config.ts forwards /api to the API (RNF-09)
export const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ProblemDetails>) => {
    const problem = error.response?.data
    // No response, or one that did not come from the API — the proxy answering for an
    // API it cannot reach. Either way there is no code to read (requirements, RF-19).
    if (!problem?.code) throw new ApiError('NETWORK_ERROR')
    throw new ApiError(problem.code, problem.params, problem.errors)
  },
)
