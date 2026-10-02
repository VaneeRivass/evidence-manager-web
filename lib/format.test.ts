import { describe, expect, it } from 'vitest'
import { formatSize } from './format'

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
