import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import type { ApiError } from './api'
import { message } from './messages.es'

type Form<T extends FieldValues> = Pick<
  UseFormReturn<T>,
  'setError' | 'setFocus'
>

// RF-18 · puts a VALIDATION_ERROR's field errors on the form's own fields and focuses the
// first, so a screen reader reads the message where it belongs. Returns false when none of
// them is the form's: the caller then decides where the error goes (RF-19).
export function placeFieldErrors<T extends FieldValues>(
  error: ApiError,
  fields: Path<T>[],
  { setError, setFocus }: Form<T>,
): boolean {
  if (error.code !== 'VALIDATION_ERROR') return false

  const own = error.fieldErrors.filter((f) =>
    (fields as string[]).includes(f.field),
  )
  if (own.length === 0) return false

  for (const f of own) {
    setError(f.field as Path<T>, { message: message(f.code, f.params) })
  }
  setFocus(own[0].field as Path<T>)
  return true
}
