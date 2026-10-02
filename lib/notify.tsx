import { toast } from 'sonner'
import type { ApiError } from './api'
import { CODE_LABEL, message } from './messages.es'

// RF-19 · an operation error: a floating notice carrying the code. No retry button: the
// action's own button is still on screen, and pressing it again is the retry. Shown by the
// query client for every failed action (providers.tsx).
export function notifyError(err: ApiError) {
  toast.error(message(err.code, err.params), {
    // Secondary, as on the error screens (mockup screen 24)
    description: (
      <>
        {CODE_LABEL}: <b className="font-semibold">{err.code}</b>
      </>
    ),
    // One notice per code: a repeat replaces it instead of piling up behind it
    id: err.code,
    // Long enough to read the code; pointing at it pauses the count
    duration: 10_000,
  })
}

// RF-19 · a success notice, which dismisses itself — only where the result is not on
// screen (RF-16)
export function notifySuccess(text: string) {
  toast.success(text)
}
