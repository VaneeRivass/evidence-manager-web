import { describe, expect, it } from 'vitest'
import {
  caseSchema,
  DESCRIPTION_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
  registerSchema,
  TITLE_MAX,
} from './schemas'

// The API's rules, copied by hand (RF-01b, RF-05): whatever the browser accepts, the API must
// accept too, and the other way round
const validCase = (title: string, description = 'Descripción') =>
  caseSchema.safeParse({ title, description }).success

const validPassword = (password: string) =>
  registerSchema.safeParse({ email: 'ana@ejemplo.com', password }).success

describe('caseSchema', () => {
  it('needs a title once the spaces around it are gone', () => {
    expect(validCase('')).toBe(false)
    expect(validCase('   ')).toBe(false)
    expect(
      caseSchema.parse({ title: '  Robo  ', description: 'x' }).title,
    ).toBe('Robo')
  })

  it('takes 120 characters and not 121', () => {
    expect(validCase('a'.repeat(TITLE_MAX))).toBe(true)
    expect(validCase('a'.repeat(TITLE_MAX + 1))).toBe(false)
  })

  it('counts an emoji as one character, as the API and the database do', () => {
    expect(validCase('📎'.repeat(TITLE_MAX))).toBe(true)
    expect(validCase('📎'.repeat(TITLE_MAX + 1))).toBe(false)
  })

  it('needs a description of 1 to 2,000 characters', () => {
    expect(validCase('Robo', ' ')).toBe(false)
    expect(validCase('Robo', 'a'.repeat(DESCRIPTION_MAX))).toBe(true)
    expect(validCase('Robo', 'a'.repeat(DESCRIPTION_MAX + 1))).toBe(false)
  })
})

describe('registerSchema', () => {
  it('measures the password in bytes, 8 to 72', () => {
    expect(validPassword('a'.repeat(PASSWORD_MIN - 1))).toBe(false)
    expect(validPassword('a'.repeat(PASSWORD_MIN))).toBe(true)
    expect(validPassword('a'.repeat(PASSWORD_MAX))).toBe(true)
    expect(validPassword('a'.repeat(PASSWORD_MAX + 1))).toBe(false)
  })

  it('counts an accented letter as two bytes', () => {
    // 4 characters, 8 bytes: long enough
    expect(validPassword('ññññ')).toBe(true)
    // 37 characters, 74 bytes: too long, though under 72 characters
    expect(validPassword('á'.repeat(37))).toBe(false)
  })
})
