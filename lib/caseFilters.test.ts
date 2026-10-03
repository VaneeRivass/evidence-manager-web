import { describe, expect, it } from 'vitest'
import { type CaseListFilters, casesHref, readFilters } from './caseFilters'

// RF-06 · the address is where the filters live: readFilters turns it into a filter safe to
// send, casesHref turns a filter back into the address.

describe('readFilters', () => {
  it('reads the status in any case and defaults the sort', () => {
    expect(readFilters(new URLSearchParams('status=open'))).toEqual({
      status: 'OPEN',
      sort: 'updatedAt',
    })
    expect(
      readFilters(new URLSearchParams('status=Closed&sort=createdAt')),
    ).toEqual({
      status: 'CLOSED',
      sort: 'createdAt',
    })
  })

  it('falls back to the defaults for anything unknown, so the API never sees a bad filter', () => {
    expect(readFilters(new URLSearchParams('status=NOPE&sort=weird'))).toEqual({
      status: undefined,
      sort: 'updatedAt',
    })
    expect(readFilters(new URLSearchParams())).toEqual({
      status: undefined,
      sort: 'updatedAt',
    })
  })
})

describe('casesHref', () => {
  it('leaves the default sort out, so the plain list keeps the plain address', () => {
    expect(casesHref({ sort: 'updatedAt' })).toBe('/cases')
  })

  it('writes the status lower-case and an explicit sort', () => {
    expect(casesHref({ status: 'OPEN', sort: 'createdAt' })).toBe(
      '/cases?status=open&sort=createdAt',
    )
  })

  it('round-trips through readFilters', () => {
    const filters: CaseListFilters = { status: 'CLOSED', sort: 'createdAt' }
    const query = casesHref(filters).split('?')[1]

    expect(readFilters(new URLSearchParams(query))).toEqual(filters)
  })
})
