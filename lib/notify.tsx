import { toast } from 'sonner'
import { isUnauthenticated, toApiError } from './api'
import { CODE_LABEL, message } from './messages.es'

// RF-19 · an operation error: a floating notice with the code. No retry button: the
// action's own button, still on screen, is the retry.
export function notifyError(error: unknown) {
  // A 401 gets none: the page is already leaving for the login
  if (isUnauthenticated(error)) return

  const { code, params } = toApiError(error)
  toast.error(message(code, params), {
    description: (
      <>
        {CODE_LABEL}: <b className="font-semibold">{code}</b>
      </>
    ),
    id: code, // the same error replaces its notice instead of piling up
    duration: 10_000, // long enough to read the code; pointing at it pauses the count
  })
}

// RF-19 · a success notice, only where the result is not on screen (RF-16)
export function notifySuccess(text: string) {
  toast.success(text)
}
