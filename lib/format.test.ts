import { describe, expect, it } from 'vitest'
import { formatDate, formatSize, formatWhen } from './format'

// Sizes as a person reads them. Both rounding cases below were bugs found by hand in #8.
describe('formatSize', () => {
  it('counts bytes exactly under 1 KB', () => {
    expect(formatSize(1)).toBe('1 byte')
    expect(formatSize(396)).toBe('396 bytes')
  })

  it('rounds to KB, then to MB with one decimal, in Spanish', () => {
    expect(formatSize(1024)).toBe('1 KB')
    expect(formatSize(200 * 1024)).toBe('200 KB')
    expect(formatSize(2.4 * 1024 * 1024)).toBe('2,4 MB')
  })

  it('never reads «1024 KB»: a size that rounds up to it is already 1 MB', () => {
    expect(formatSize(1_048_200)).toBe('1 MB')
  })
})

// A fixed «now» so the tests do not depend on the clock
const now = new Date('2026-09-24T12:00:00.000Z')
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString()

describe('formatWhen', () => {
  it('says «ahora» for anything under a minute', () => {
    expect(formatWhen(ago(30_000), now)).toBe('ahora')
  })

  it('counts minutes and hours in Spanish', () => {
    expect(formatWhen(ago(5 * 60_000), now)).toBe('hace 5 min')
    expect(formatWhen(ago(2 * 3_600_000), now)).toBe('hace 2 h')
  })

  it('says «ayer» for the day before', () => {
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    yesterday.setHours(10, 0, 0, 0)

    expect(formatWhen(yesterday.toISOString(), now)).toBe('ayer')
  })

  it('writes the day and month for this year, and adds the year otherwise', () => {
    const thisYear = new Date('2026-09-20T10:00:00.000Z')

    expect(formatWhen(thisYear.toISOString(), now)).toMatch(/20/)
    expect(formatWhen(thisYear.toISOString(), now)).not.toMatch(/2026/)
    expect(formatWhen('2025-09-20T10:00:00.000Z', now)).toMatch(/2025/)
  })
})

describe('formatDate', () => {
  it('says «hoy, HH:MM» for today', () => {
    const today = new Date(now)
    today.setHours(9, 30, 0, 0)

    expect(formatDate(today.toISOString(), now)).toMatch(/^hoy, /)
  })

  it('writes the full date for another day', () => {
    expect(formatDate('2026-09-20T09:30:00.000Z', now)).toMatch(/2026/)
  })
})
