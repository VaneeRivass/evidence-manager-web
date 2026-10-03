import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './api'
import { notifyError, notifySuccess } from './notify'

// RF-19 · how a failed or successful action reaches the person as a floating notice.
vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sonner')>()
  return { ...actual, toast: { error: vi.fn(), success: vi.fn() } }
})

describe('notifyError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the sentence and, as its id, the code, so a repeat replaces it', () => {
    notifyError(new ApiError('NETWORK_ERROR'))

    expect(toast.error).toHaveBeenCalledOnce()
    expect(vi.mocked(toast.error).mock.calls[0][0]).toMatch(
      /No pudimos conectar con el servidor/,
    )
    expect(vi.mocked(toast.error).mock.calls[0][1]).toMatchObject({
      id: 'NETWORK_ERROR',
    })
  })

  it('stays silent on a 401: the page is already leaving for the login', () => {
    notifyError(new ApiError('UNAUTHENTICATED'))

    expect(toast.error).not.toHaveBeenCalled()
  })
})

describe('notifyError · the code decides the sentence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    ['EMAIL_TAKEN', /Ya existe una cuenta con este correo/],
    ['INVALID_CREDENTIALS', /El correo o la contraseña no son correctos/],
    ['UPLOAD_FAILED', /La subida se interrumpió/],
    ['FILE_ALREADY_ATTACHED', /ya tiene un archivo/],
    ['INTERNAL_ERROR', /Algo falló en el servidor/],
  ])('shows the sentence for %s', (code, sentence) => {
    notifyError(new ApiError(code))

    expect(vi.mocked(toast.error).mock.calls[0][0]).toMatch(sentence)
  })
})

describe('notifySuccess', () => {
  it('shows the message it is given', () => {
    notifySuccess('Caso eliminado')

    expect(toast.success).toHaveBeenCalledWith('Caso eliminado')
  })
})
