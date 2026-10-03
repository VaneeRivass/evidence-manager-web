import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './api'
import { showFieldErrors } from './formErrors'

// RF-18 · a validation error goes under the form's own field and nowhere else. What the form
// does not own is left for the caller to show as a notice.

function target() {
  return { setError: vi.fn(), setFocus: vi.fn() }
}

describe('showFieldErrors', () => {
  it('places the error under the field and focuses the first one', () => {
    const form = target()

    const handled = showFieldErrors(
      new ApiError('VALIDATION_ERROR', {}, [
        { field: 'title', code: 'TOO_LONG', params: { max: 120 } },
      ]),
      ['title', 'description'],
      form,
    )

    expect(handled).toBe(true)
    expect(form.setError).toHaveBeenCalledWith('title', {
      message: 'Máximo 120 caracteres.',
    })
    expect(form.setFocus).toHaveBeenCalledWith('title')
  })

  it('returns false and touches nothing when the errors are not the form own fields', () => {
    const form = target()

    const handled = showFieldErrors(
      new ApiError('VALIDATION_ERROR', {}, [
        { field: 'other', code: 'TOO_LONG' },
      ]),
      ['title', 'description'],
      form,
    )

    expect(handled).toBe(false)
    expect(form.setError).not.toHaveBeenCalled()
    expect(form.setFocus).not.toHaveBeenCalled()
  })

  it('returns false for a code that is not a validation error', () => {
    const form = target()

    expect(
      showFieldErrors(new ApiError('NETWORK_ERROR'), ['title'], form),
    ).toBe(false)
  })
})
