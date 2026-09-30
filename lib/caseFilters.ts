// RF-06 · the list's filter and ordering, read from and written to the address. The
// address is typed by people and the API answers 400 to a value it does not know, so
// anything unrecognised is dropped and the default used instead (RF-15).

export type CaseStatus = 'OPEN' | 'CLOSED'
export type CaseSort = 'updatedAt' | 'createdAt'
export type CaseFilters = { status?: CaseStatus; sort: CaseSort }

const DEFAULT_SORT: CaseSort = 'updatedAt'

export function readFilters(params: URLSearchParams): CaseFilters {
  const status = params.get('status')?.toUpperCase()
  const sort = params.get('sort')

  return {
    status: status === 'OPEN' || status === 'CLOSED' ? status : undefined,
    sort: sort === 'createdAt' ? sort : DEFAULT_SORT,
  }
}

// The list's address for these filters. The default is left out, so the plain list keeps
// the plain address: /cases
export function casesHref({ status, sort }: CaseFilters): string {
  const params = new URLSearchParams()
  if (status) params.set('status', status.toLowerCase())
  if (sort !== DEFAULT_SORT) params.set('sort', sort)
  const query = params.toString()
  return query ? `/cases?${query}` : '/cases'
}
