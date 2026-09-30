import { toast } from 'sonner'
import { ApiError } from './api'
import { message } from './messages.es'

// RF-19 · an operation error: a floating notice carrying the code, which waits to be
// dismissed. Anything that is not an ApiError reads as INTERNAL_ERROR.
export function notifyError(error: unknown) {
  const err = error instanceof ApiError ? error : new ApiError('INTERNAL_ERROR')

  toast.error(message(err.code, err.params), {
    description: err.code,
    duration: Infinity,
    closeButton: true,
  })
}
