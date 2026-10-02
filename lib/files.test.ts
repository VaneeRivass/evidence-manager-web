import { describe, expect, it } from 'vitest'
import { checkFile, MAX_FILE_BYTES } from './files'

// RF-17 · the API's limits, copied: the allowed types, and 5 MB with the limit itself allowed

// A File whose size is declared without allocating it
function fileOf(type: string, size = 1000) {
  const file = new File([], 'evidencia', { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('checkFile', () => {
  it('accepts a PDF, a JPG and a PNG, whatever the case of the type', () => {
    expect(checkFile(fileOf('application/pdf'))).toBeNull()
    expect(checkFile(fileOf('image/jpeg'))).toBeNull()
    expect(checkFile(fileOf('IMAGE/PNG'))).toBeNull()
  })

  it('rejects any other type, and a file the browser gives no type', () => {
    expect(checkFile(fileOf('image/webp'))?.code).toBe('FILE_TYPE_NOT_ALLOWED')
    expect(checkFile(fileOf(''))?.code).toBe('FILE_TYPE_NOT_ALLOWED')
  })

  it('accepts exactly 5 MB and rejects one byte more', () => {
    expect(checkFile(fileOf('application/pdf', MAX_FILE_BYTES))).toBeNull()
    expect(checkFile(fileOf('application/pdf', MAX_FILE_BYTES + 1))).toEqual({
      code: 'FILE_TOO_LARGE',
      params: {
        name: 'evidencia',
        size: MAX_FILE_BYTES + 1,
        max: MAX_FILE_BYTES,
      },
    })
  })
})
