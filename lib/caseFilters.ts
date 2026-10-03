// The list's filter and ordering, kept in the address. Anyone can type it, so an unknown
// value falls back to the default instead of reaching the API as a 400 (RF-06).

import type { CaseStatus } from './cases'

export type CaseSort = 'updatedAt' | 'createdAt'
export type CaseListFilters = { status?: CaseStatus; sort: CaseSort }

const DEFAULT_SORT: CaseSort = 'updatedAt'

export function readFilters(params: URLSearchParams): CaseListFilters {
  const status = params.get('status')?.toUpperCase()
  const sort = params.get('sort')

  return {
    status: status === 'OPEN' || status === 'CLOSED' ? status : undefined,
    sort: sort === 'createdAt' ? sort : DEFAULT_SORT,
  }
}

// The list's address for these filters. The default is left out, so the plain list keeps
// the plain address: /cases
export function casesHref({ status, sort }: CaseListFilters): string {
  const params = new URLSearchParams()
  if (status) params.set('status', status.toLowerCase())
  if (sort !== DEFAULT_SORT) params.set('sort', sort)
  const query = params.toString()
  return query ? `/cases?${query}` : '/cases'
}
