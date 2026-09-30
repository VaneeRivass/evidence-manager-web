import type { UseFormReturn } from 'react-hook-form'
import { toApiError } from '@/lib/api'
import { message } from '@/lib/messages.es'
import { notifyError } from '@/lib/notify'
import type { Credentials } from '@/lib/schemas'

type Form = Pick<UseFormReturn<Credentials>, 'setError' | 'setFocus'>

// Where an API error renders on the sign-in forms — requirements, RF-18 and RF-19:
// under its field, above the button when it concerns the whole form, or floating. Focus
// goes to the field the message is about, so a screen reader reads it where it belongs.
export function showAuthError(error: unknown, { setError, setFocus }: Form) {
  const err = toApiError(error)

  if (err.code === 'VALIDATION_ERROR') {
    const own = err.fieldErrors.filter(
      (f) => f.field === 'email' || f.field === 'password',
    )
    for (const f of own) {
      setError(f.field as keyof Credentials, {
        message: message(f.code, f.params),
      })
    }
    if (own.length > 0) {
      setFocus(own[0].field as keyof Credentials)
      return
    }
  }

  if (err.code === 'EMAIL_TAKEN') {
    setError('email', { message: message(err.code) }, { shouldFocus: true })
    return
  }

  // The API does not say which field failed, on purpose (RF-02)
  if (err.code === 'INVALID_CREDENTIALS') {
    setError('root', { message: message(err.code) })
    setFocus('password')
    return
  }

  notifyError(err)
}
