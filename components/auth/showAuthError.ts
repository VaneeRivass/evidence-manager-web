import { toApiError } from '@/lib/api'
import { type FormErrorTarget, showFieldErrors } from '@/lib/formErrors'
import { message } from '@/lib/messages.es'
import { CREDENTIAL_FIELDS, type Credentials } from '@/lib/schemas'

// RF-18 · the errors the sign-in forms show themselves. False for any other: the caller
// shows a notice.
export function showAuthError(
  error: unknown,
  form: FormErrorTarget<Credentials>,
): boolean {
  if (showFieldErrors(error, CREDENTIAL_FIELDS, form)) return true

  const { code } = toApiError(error)

  if (code === 'EMAIL_TAKEN') {
    form.setError('email', { message: message(code) }, { shouldFocus: true })
    return true
  }

  if (code === 'INVALID_CREDENTIALS') {
    // Above the button: the API does not say which field failed, on purpose (RF-02)
    form.setError('root', { message: message(code) })
    form.setFocus('password')
    return true
  }

  return false
}
