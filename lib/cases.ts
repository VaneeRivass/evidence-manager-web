// The domain model. It lives in lib/, not in a hook: components and hooks both import it
// from here, so nobody has to reach into a data hook for a type.

// The domain owns its status; the list's filters use it, not the other way round.
// What the API sends for a case (evidence-manager-api, cases.mapper.ts)
export type CaseStatus = 'OPEN' | 'CLOSED'

export type Case = {
  id: string
  title: string
  description: string
  status: CaseStatus
  fileName: string | null
  fileSize: number | null
  fileType: string | null
  createdAt: string
  updatedAt: string
}

// At most 100 items; total counts every case matching the filter (RF-06)
export type CasesPage = { items: Case[]; total: number }

// The API path of one case. The id comes from the address, which anyone can type: encoded,
// `/cases/..%2Fauth%2Fme` stays one path segment the API rejects as malformed, instead of
// becoming another route
export const casePath = (id: string) => `/cases/${encodeURIComponent(id)}`
