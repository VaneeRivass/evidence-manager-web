import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { toApiError } from './api'
import { message } from './messages.es'

export type FormErrorTarget<T extends FieldValues> = Pick<
  UseFormReturn<T>,
  'setError' | 'setFocus'
>

// A VALIDATION_ERROR's messages under the form's own fields, focusing the first so a screen
// reader reads it there. False when none is the form's: the caller shows a notice (RF-18).
export function showFieldErrors<T extends FieldValues>(
  error: unknown,
  fields: readonly Path<T>[],
  { setError, setFocus }: FormErrorTarget<T>,
): boolean {
  const { code, fieldErrors } = toApiError(error)
  if (code !== 'VALIDATION_ERROR') return false

  const own = fieldErrors.filter((f) => fields.includes(f.field as Path<T>))
  if (own.length === 0) return false

  for (const f of own) {
    setError(f.field as Path<T>, { message: message(f.code, f.params) })
  }
  setFocus(own[0].field as Path<T>)
  return true
}
