import * as z from 'zod'
import { message } from './messages.es'

// Mirrors evidence-manager-api/src/modules/auth/auth.schema.ts by hand: the repositories
// are independent (requirements, known limitations). Errors are written through the same
// table as the API's codes, so the browser and the server say the same thing.

// Each limit is written once and feeds both the rule and its message, so they cannot
// drift apart. The values are the API's (RF-01a, RF-01b).
const EMAIL_MAX = 254
const PASSWORD_MIN = 8
const PASSWORD_MAX = 72

// RF-01a · trimmed, up to 254 characters, lowercase
const email = z
  .string()
  .trim()
  .max(EMAIL_MAX, message('TOO_LONG', { max: EMAIL_MAX }))
  .toLowerCase()
  .pipe(z.email(message('INVALID_FORMAT')))

// RF-01b · 8 to 72 BYTES, as the API counts them. The API uses Node's Buffer, which does
// not exist in the browser; TextEncoder gives the same UTF-8 length. Counting characters
// instead would let through a password with accents or emoji that the API then rejects.
const bytes = (value: string) => new TextEncoder().encode(value).length

const newPassword = z
  .string()
  .refine(
    (value) => bytes(value) >= PASSWORD_MIN,
    message('TOO_SHORT', { min: PASSWORD_MIN }),
  )
  .refine(
    (value) => bytes(value) <= PASSWORD_MAX,
    message('TOO_LONG', { max: PASSWORD_MAX }),
  )

export const registerSchema = z.object({ email, password: newPassword })

// RF-02 · on login the password is only required: one set under an older policy must
// still sign in
export const loginSchema = z.object({
  email,
  password: z.string().min(1, message('TOO_SHORT', { min: 1 })),
})

export type Credentials = z.infer<typeof loginSchema>

// RF-05 · a case's title and description, the API's Zod rule copied: trimmed, then 1 to the
// column's size. Zod's .max() counts .length (UTF-16 units: an emoji counts as 2), and so
// does this — whatever the browser accepts, the API accepts too.
export const TITLE_MAX = 120
export const DESCRIPTION_MAX = 2000

const requiredText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, message('TOO_SHORT', { min: 1 }))
    .max(max, message('TOO_LONG', { max }))

export const caseSchema = z.object({
  title: requiredText(TITLE_MAX),
  description: requiredText(DESCRIPTION_MAX),
})

export type CaseInput = z.infer<typeof caseSchema>
