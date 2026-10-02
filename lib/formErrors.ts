import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import type { ApiError } from './api'
import { message } from './messages.es'
import { CASE_FIELDS, CREDENTIAL_FIELDS } from './schemas'

type Form<T extends FieldValues> = Pick<
  UseFormReturn<T>,
  'setError' | 'setFocus'
>

// A VALIDATION_ERROR's errors that name one of these fields
const ownFieldErrors = (error: ApiError, fields: readonly string[]) =>
  error.code === 'VALIDATION_ERROR'
    ? error.fieldErrors.filter((f) => fields.includes(f.field))
    : []

// RF-18 · which errors each form places on screen itself, written once. The hooks hand
// these to the query client (providers.tsx), which shows every other error as a notice —
// even if the form is gone by the time the answer arrives. The forms place these and no
// others.
export const placedOnCaseForm = (error: ApiError) =>
  ownFieldErrors(error, CASE_FIELDS).length > 0

export const placedOnCredentialsForm = (error: ApiError) =>
  ownFieldErrors(error, CREDENTIAL_FIELDS).length > 0 ||
  error.code === 'EMAIL_TAKEN' ||
  error.code === 'INVALID_CREDENTIALS'

// RF-18 · puts a VALIDATION_ERROR's field errors on the form's own fields and focuses the
// first, so a screen reader reads the message where it belongs. Returns false when none of
// them is the form's.
export function placeFieldErrors<T extends FieldValues>(
  error: ApiError,
  fields: readonly Path<T>[],
  { setError, setFocus }: Form<T>,
): boolean {
  const own = ownFieldErrors(error, fields)
  if (own.length === 0) return false

  for (const f of own) {
    setError(f.field as Path<T>, { message: message(f.code, f.params) })
  }
  setFocus(own[0].field as Path<T>)
  return true
}
