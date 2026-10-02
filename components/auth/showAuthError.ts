import type { UseFormReturn } from 'react-hook-form'
import { toApiError } from '@/lib/api'
import { placeFieldErrors, placedOnCredentialsForm } from '@/lib/formErrors'
import { message } from '@/lib/messages.es'
import { CREDENTIAL_FIELDS, type Credentials } from '@/lib/schemas'

type Form = Pick<UseFormReturn<Credentials>, 'setError' | 'setFocus'>

// Where an API error renders on the sign-in forms — requirements, RF-18: under its field,
// or above the button when it concerns the whole form. Only the errors
// placedOnCredentialsForm names; any other is a notice, from the query client.
export function showAuthError(error: unknown, form: Form) {
  const err = toApiError(error)
  if (!placedOnCredentialsForm(err)) return

  if (placeFieldErrors(err, CREDENTIAL_FIELDS, form)) return

  if (err.code === 'EMAIL_TAKEN') {
    form.setError(
      'email',
      { message: message(err.code) },
      { shouldFocus: true },
    )
    return
  }

  // INVALID_CREDENTIALS. The API does not say which field failed, on purpose (RF-02)
  form.setError('root', { message: message(err.code) })
  form.setFocus('password')
}
