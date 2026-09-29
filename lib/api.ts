import axios, { type AxiosError } from 'axios'

// The only place in this application that makes HTTP requests. Hooks say what to request
// and when; how a request is made, and how an error is read, lives here.

type Params = Record<string, string | number>

export type FieldError = { field: string; code: string; params?: Params }

// The API's error body: RFC 9457 plus a stable code (RF-21, RF-22, RF-23)
type ProblemDetails = {
  status: number
  code: string
  params?: Params
  errors?: FieldError[]
  requestId?: string
}

export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly status?: number,
    readonly params: Params = {},
    readonly fieldErrors: FieldError[] = [],
    readonly requestId?: string,
  ) {
    super(code)
    this.name = 'ApiError'
  }
}

// Relative on purpose: the rewrite in next.config.ts forwards /api to the API (RNF-09)
export const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ProblemDetails>) => {
    const problem = error.response?.data
    // No response, or one that did not come from the API — the proxy answering for an
    // API it cannot reach. Either way there is no code to read (requirements, RF-19).
    if (!problem?.code) throw new ApiError('NETWORK_ERROR')
    throw new ApiError(
      problem.code,
      problem.status,
      problem.params,
      problem.errors,
      problem.requestId,
    )
  },
)
