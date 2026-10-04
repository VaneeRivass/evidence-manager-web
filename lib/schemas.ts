import * as z from 'zod'
import { message } from './messages.es'

// The API's rules (auth.schema.ts, cases.schema.ts), copied: the repositories are separate.
// Messages come from the same table as the API's codes, so both say the same thing.

// The API's values (RF-01a, RF-01b); written once so rule and message cannot drift.
const EMAIL_MAX = 254
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 64

// Trimmed, up to 254 characters, lowercase (RF-01a)
const email = z
  .string()
  .trim()
  .max(EMAIL_MAX, message('TOO_LONG', { max: EMAIL_MAX }))
  .toLowerCase()
  .pipe(z.email(message('INVALID_FORMAT')))

// Counted on NFC, never bytes, so the accent is one character either way (RF-01b)
const passwordCharacters = (value: string) => [...value.normalize('NFC')].length

// A passphrase keeps its spaces; only whitespace alone is its own code. The first check that
// fails stops the rest, so one value gives one error (RF-01b)
const newPassword = z.string().superRefine((value, ctx) => {
  if (value.trim() === '') {
    ctx.addIssue({ code: 'custom', message: message('PASSWORD_BLANK') })
    return
  }

  const size = passwordCharacters(value)
  if (size < PASSWORD_MIN) {
    ctx.addIssue({
      code: 'custom',
      message: message('TOO_SHORT', { min: PASSWORD_MIN }),
    })
    return
  }

  if (size > PASSWORD_MAX) {
    ctx.addIssue({
      code: 'custom',
      message: message('TOO_LONG', { max: PASSWORD_MAX }),
    })
  }
})

export const registerSchema = z.object({ email, password: newPassword })

// Only required here, capped as the API does so a longer text is never hashed (RF-02)
export const loginSchema = z.object({
  email,
  password: z.string().superRefine((value, ctx) => {
    const size = passwordCharacters(value)
    if (size < 1) {
      ctx.addIssue({
        code: 'custom',
        message: message('TOO_SHORT', { min: 1 }),
      })
      return
    }

    if (size > PASSWORD_MAX) {
      ctx.addIssue({
        code: 'custom',
        message: message('TOO_LONG', { max: PASSWORD_MAX }),
      })
    }
  }),
})

export type Credentials = z.infer<typeof loginSchema>

// The form's fields, from the schema: where an API error on one of them goes (RF-18)
export const CREDENTIAL_FIELDS = loginSchema.keyof().options

// Code points, as Zod 4 counts them: «😀» is 1, though its .length is 2
export const characterCount = (value: string) => [...value].length

// The API's column sizes, in code points (RF-05)
export const TITLE_MAX = 120
export const DESCRIPTION_MAX = 2000

// Nothing visible is as empty as nothing. The invisible ones are only tested for, never
// removed (🚶‍♂️ is joined by one); a null character is checked first (RF-05)
const VISIBLE = /[^\s\p{Cc}\p{Default_Ignorable_Code_Point}]/u

const requiredText = (max: number) =>
  z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value.includes('\0')) {
        ctx.addIssue({ code: 'custom', message: message('INVALID_FORMAT') })
        return
      }

      if (!VISIBLE.test(value)) {
        ctx.addIssue({
          code: 'custom',
          message: message('TOO_SHORT', { min: 1 }),
        })
        return
      }

      if (characterCount(value) > max) {
        ctx.addIssue({ code: 'custom', message: message('TOO_LONG', { max }) })
      }
    })

export const caseSchema = z.object({
  title: requiredText(TITLE_MAX),
  description: requiredText(DESCRIPTION_MAX),
})

export type CaseInput = z.infer<typeof caseSchema>

export const CASE_FIELDS = caseSchema.keyof().options
