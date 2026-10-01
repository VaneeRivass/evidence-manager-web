import type { UseFormReturn } from 'react-hook-form'
import { toApiError } from '@/lib/api'
import { placeFieldErrors } from '@/lib/formErrors'
import { message } from '@/lib/messages.es'
import { notifyError } from '@/lib/notify'
import type { Credentials } from '@/lib/schemas'

type Form = Pick<UseFormReturn<Credentials>, 'setError' | 'setFocus'>

// Where an API error renders on the sign-in forms — requirements, RF-18 and RF-19: under
// its field, above the button when it concerns the whole form, or floating
export function showAuthError(error: unknown, form: Form) {
  const err = toApiError(error)

  if (placeFieldErrors(err, ['email', 'password'], form)) return

  if (err.code === 'EMAIL_TAKEN') {
    form.setError(
      'email',
      { message: message(err.code) },
      { shouldFocus: true },
    )
    return
  }

  // The API does not say which field failed, on purpose (RF-02)
  if (err.code === 'INVALID_CREDENTIALS') {
    form.setError('root', { message: message(err.code) })
    form.setFocus('password')
    return
  }

  notifyError(err)
}
