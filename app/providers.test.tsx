import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCaseStatus, useSaveCase } from '@/hooks/useCases'
import { api, ApiError } from '@/lib/api'
import { goToLogin } from '@/lib/session'
import { Providers } from './providers'

// RF-19 · an action without a form gets its notice from here. RF-14 · a 401 signs out.
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return { ...actual, api: { post: vi.fn(), patch: vi.fn() } }
})

vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sonner')>()
  return { ...actual, toast: { error: vi.fn(), success: vi.fn() } }
})

vi.mock('@/lib/session', () => ({ goToLogin: vi.fn() }))

// The case page's «Cerrar caso», reduced to its button
function CloseCaseButton() {
  const status = useCaseStatus('c1')
  return <button onClick={() => status.mutate('CLOSED')}>Cerrar caso</button>
}

// A form's save, without the form: its errors are the form's to show
function SaveWithoutForm() {
  const save = useSaveCase()
  return (
    <button onClick={() => save.mutate({ title: 'Robo', description: 'x' })}>
      Crear caso
    </button>
  )
}

function press(name: string, button: React.ReactNode) {
  render(<Providers>{button}</Providers>)
  fireEvent.click(screen.getByRole('button', { name }))
}

describe('Providers · a failed request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a notice with the code for an action without a form', async () => {
    vi.mocked(api.patch).mockRejectedValue(new ApiError('NETWORK_ERROR'))

    press('Cerrar caso', <CloseCaseButton />)

    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce())
    expect(vi.mocked(toast.error).mock.calls[0][0]).toMatch(
      /No pudimos conectar con el servidor/,
    )
  })

  it('leaves the notice to the form when the form shows its own errors', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError('NETWORK_ERROR'))

    press('Crear caso', <SaveWithoutForm />)

    await waitFor(() => expect(api.post).toHaveBeenCalled())
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('on a 401, goes to the login with no notice', async () => {
    vi.mocked(api.patch).mockRejectedValue(new ApiError('UNAUTHENTICATED'))

    press('Cerrar caso', <CloseCaseButton />)

    await waitFor(() => expect(goToLogin).toHaveBeenCalledOnce())
    expect(toast.error).not.toHaveBeenCalled()
  })
})
