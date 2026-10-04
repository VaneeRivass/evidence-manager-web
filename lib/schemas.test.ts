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

  it('needs something visible, not only invisible characters', () => {
    expect(validCase('\u200B')).toBe(false)
    expect(validCase('\u200B\u2060\uFEFF')).toBe(false)
    expect(validCase(' \u200B\t')).toBe(false)
  })

  it('keeps the invisible characters of a title that has visible text', () => {
    const parsed = caseSchema.parse({ title: 'Caminata 🚶‍♂️', description: 'x' })

    expect(parsed.title).toBe('Caminata 🚶‍♂️')
  })

  it('rejects a null character, which the database cannot store', () => {
    expect(validCase('a\u0000b')).toBe(false)
  })

  it('takes 120 characters and not 121', () => {
    expect(validCase('a'.repeat(TITLE_MAX))).toBe(true)
    expect(validCase('a'.repeat(TITLE_MAX + 1))).toBe(false)
  })

  it('counts an emoji as one character, as the API and the database do', () => {
    expect(validCase('📎'.repeat(TITLE_MAX))).toBe(true)
    expect(validCase('📎'.repeat(TITLE_MAX + 1))).toBe(false)
  })

  it('counts a composed emoji by its code points', () => {
    // 🚶‍♂️ is 4 code points, so 30 fit in 120 and 31 do not
    expect(validCase('🚶‍♂️'.repeat(30))).toBe(true)
    expect(validCase('🚶‍♂️'.repeat(31))).toBe(false)
  })

  it('needs a description of 1 to 2,000 characters', () => {
    expect(validCase('Robo', ' ')).toBe(false)
    expect(validCase('Robo', 'a'.repeat(DESCRIPTION_MAX))).toBe(true)
    expect(validCase('Robo', 'a'.repeat(DESCRIPTION_MAX + 1))).toBe(false)
  })
})

describe('registerSchema', () => {
  it('measures the password in characters, 8 to 64', () => {
    expect(validPassword('a'.repeat(PASSWORD_MIN - 1))).toBe(false)
    expect(validPassword('a'.repeat(PASSWORD_MIN))).toBe(true)
    expect(validPassword('a'.repeat(PASSWORD_MAX))).toBe(true)
    expect(validPassword('a'.repeat(PASSWORD_MAX + 1))).toBe(false)
  })

  it('counts an accented letter as one character, not two bytes', () => {
    // 4 characters: too short, though 8 bytes
    expect(validPassword('ññññ')).toBe(false)
    // 64 characters: fits, though 128 bytes
    expect(validPassword('ñ'.repeat(PASSWORD_MAX))).toBe(true)
  })

  it('counts a decomposed accent as one character, on the NFC form', () => {
    expect(validPassword('e\u0301'.repeat(4))).toBe(false)
    expect(validPassword('e\u0301'.repeat(8))).toBe(true)
  })

  it('rejects a password made only of whitespace', () => {
    expect(validPassword('        ')).toBe(false)
    expect(validPassword('\t\n'.repeat(4))).toBe(false)
  })

  it('keeps the spaces of a password as typed', () => {
    const parsed = registerSchema.parse({
      email: 'ana@ejemplo.com',
      password: '  clave segura  ',
    })

    expect(parsed.password).toBe('  clave segura  ')
  })
})
