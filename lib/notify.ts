import { toast } from 'sonner'
import { isUnauthenticated, toApiError } from './api'
import { message } from './messages.es'

// RF-19 · an operation error: a floating notice carrying the code, which waits to be
// dismissed. A 401 gets none: the page is already leaving for the login (providers.tsx).
export function notifyError(error: unknown) {
  if (isUnauthenticated(error)) return
  const err = toApiError(error)

  toast.error(message(err.code, err.params), {
    description: err.code,
    duration: Infinity,
    closeButton: true,
  })
}

// RF-19 · a success notice, which dismisses itself — only where the result is not on
// screen (RF-16)
export function notifySuccess(text: string) {
  toast.success(text)
}
