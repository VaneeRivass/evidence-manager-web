import * as z from 'zod'
import { message } from './messages.es'

// The API's rules (auth.schema.ts, cases.schema.ts), copied: the repositories are separate.
// Messages come from the same table as the API's codes, so both say the same thing.

// Each limit is written once and feeds both the rule and its message, so they cannot
// drift apart. The values are the API's (RF-01a, RF-01b).
const EMAIL_MAX = 254
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 72

// Trimmed, up to 254 characters, lowercase (RF-01a)
const email = z
  .string()
  .trim()
  .max(EMAIL_MAX, message('TOO_LONG', { max: EMAIL_MAX }))
  .toLowerCase()
  .pipe(z.email(message('INVALID_FORMAT')))

// The API limits bytes, not characters: «ñ» is 2. TextEncoder counts them as Node's Buffer
// does (RF-01b).
const utf8Length = (value: string) => new TextEncoder().encode(value).length

const newPassword = z
  .string()
  .refine(
    (value) => utf8Length(value) >= PASSWORD_MIN,
    message('TOO_SHORT', { min: PASSWORD_MIN }),
  )
  .refine(
    (value) => utf8Length(value) <= PASSWORD_MAX,
    message('TOO_LONG', { max: PASSWORD_MAX }),
  )

export const registerSchema = z.object({ email, password: newPassword })

// On login the password is only required: one set under an older policy must still sign in
// (RF-02)
export const loginSchema = z.object({
  email,
  password: z.string().min(1, message('TOO_SHORT', { min: 1 })),
})

export type Credentials = z.infer<typeof loginSchema>

// The form's fields, from the schema itself: where an API error on one of them goes (RF-18)
export const CREDENTIAL_FIELDS = loginSchema.keyof().options

// The API's rule copied: trimmed, then 1 to the column's size, in characters (RF-05)
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

// Characters as Zod 4's .max() counts them — code points: «😀» is 1, though its .length is 2
// (pinned by schemas.test.ts)
export const characterCount = (value: string) => [...value].length

export const CASE_FIELDS = caseSchema.keyof().options
