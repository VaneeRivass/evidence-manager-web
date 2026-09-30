import type { UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/lib/api'
import { message } from '@/lib/messages.es'
import { notifyError } from '@/lib/notify'
import type { Credentials } from '@/lib/schemas'

// Where an API error renders on the sign-in forms — requirements, RF-18 and RF-19:
// under its field, above the button when it concerns the whole form, or floating.
export function showAuthError(
  error: unknown,
  setError: UseFormSetError<Credentials>,
) {
  const err = error instanceof ApiError ? error : new ApiError('INTERNAL_ERROR')

  if (err.code === 'VALIDATION_ERROR') {
    const own = err.fieldErrors.filter(
      (f) => f.field === 'email' || f.field === 'password',
    )
    for (const f of own) {
      setError(f.field as keyof Credentials, {
        message: message(f.code, f.params),
      })
    }
    if (own.length > 0) return
  }

  if (err.code === 'EMAIL_TAKEN') {
    setError('email', { message: message(err.code) })
    return
  }

  // The API does not say which field failed, on purpose (RF-02)
  if (err.code === 'INVALID_CREDENTIALS') {
    setError('root', { message: message(err.code) })
    return
  }

  notifyError(err)
}
