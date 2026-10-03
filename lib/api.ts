import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'

// The only place in this application that makes HTTP requests. Hooks say what to request
// and when; how a request is made, and how an error is read, lives here.

export type Params = Record<string, string | number>

export type FieldError = { field: string; code: string; params?: Params }

// What this application reads from the API's error body: RFC 9457 plus a stable code,
// its parameters and the request id support can trace (RF-21, RF-23)
type ProblemDetails = {
  status?: number
  code: string
  params?: Params
  errors?: FieldError[]
  requestId?: string
}

export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly params: Params = {},
    readonly fieldErrors: FieldError[] = [],
    readonly status = 0,
    readonly requestId?: string,
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

// No answer reached us: offline, or the API down. Asking again at once would fail the same way.
export const isNetworkError = (error: unknown): boolean =>
  error instanceof ApiError && error.code === 'NETWORK_ERROR'

// Missing, someone else's, or a malformed id: one answer for all three, so a stranger
// cannot tell that a case exists (RF-16)
const NOT_FOUND = ['CASE_NOT_FOUND', 'CASE_FORBIDDEN', 'VALIDATION_ERROR']
export const isNotFound = (error: unknown): boolean =>
  error instanceof ApiError && NOT_FOUND.includes(error.code)

// Relative on purpose: the rewrite in next.config.ts forwards /api to the API (RNF-09)
export const http = axios.create({ baseURL: '/api' })

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ProblemDetails>) => {
    const problem = error.response?.data
    // No response, or one that did not come from the API — the proxy answering for an
    // API it cannot reach. Either way there is no code to read (requirements, RF-19).
    if (!problem?.code) throw new ApiError('NETWORK_ERROR')
    throw new ApiError(
      problem.code,
      problem.params,
      problem.errors,
      problem.status ?? error.response?.status ?? 0,
      problem.requestId,
    )
  },
)

// The four verbs return the body, not axios's response envelope: the `.data` unwrap lives
// here and only here, so no hook has to remember it.
const unwrap = <T>(request: Promise<AxiosResponse<T>>): Promise<T> =>
  request.then((response) => response.data)

export const api = {
  get: <T>(path: string, config?: AxiosRequestConfig) =>
    unwrap(http.get<T>(path, config)),

  post: <T>(path: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap(http.post<T>(path, body, config)),

  patch: <T>(path: string, body?: unknown, config?: AxiosRequestConfig) =>
    unwrap(http.patch<T>(path, body, config)),

  delete: <T = void>(path: string, config?: AxiosRequestConfig) =>
    unwrap(http.delete<T>(path, config)),
}

// The file goes straight to storage. Plain axios, not `api`: storage is not our API and the
// session cookie must never reach it. Any failure is UPLOAD_FAILED (RF-17, RF-19).
export async function uploadToStorage(
  uploadUrl: string,
  file: File,
  onProgress: (fraction: number) => void,
): Promise<void> {
  try {
    await axios.put(uploadUrl, file, {
      // Must be the type that was signed, or storage refuses the upload
      headers: { 'Content-Type': file.type },
      onUploadProgress: (event) => onProgress(event.progress ?? 0),
    })
  } catch {
    throw new ApiError('UPLOAD_FAILED')
  }
}
