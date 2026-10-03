import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Providers } from '@/app/providers'
import { api, ApiError } from '@/lib/api'
import { AuthForm } from './AuthForm'

// RF-02 · RF-13 · sign in and registration share a form: what changes is the call, the
// target and, on failure, where the error lands.
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return { ...actual, api: { post: vi.fn() } }
})

vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sonner')>()
  return { ...actual, toast: { error: vi.fn(), success: vi.fn() } }
})

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}))

const post = vi.mocked(api.post)

function submit(mode: 'login' | 'register') {
  render(
    <Providers>
      <AuthForm mode={mode} />
    </Providers>,
  )
  fireEvent.change(screen.getByLabelText('Correo'), {
    target: { value: 'ana@ejemplo.com' },
  })
  fireEvent.change(screen.getByLabelText('Contraseña'), {
    target: { value: 'unaClaveLarga' },
  })
  fireEvent.click(
    screen.getByRole('button', {
      name: mode === 'login' ? 'Entrar' : 'Crear cuenta',
    }),
  )
}

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('signs in and goes to the cases', async () => {
    post.mockResolvedValue({ id: 'u1', email: 'ana@ejemplo.com' })

    submit('login')

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/cases'))
    expect(post).toHaveBeenCalledWith('/auth/login', expect.anything())
  })

  it('registers without a session, notifies and goes to the login', async () => {
    post.mockResolvedValue(undefined)

    submit('register')

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'))
    expect(post).toHaveBeenCalledWith('/auth/register', expect.anything())
    expect(toast.success).toHaveBeenCalledWith(
      'Cuenta creada. Ya puedes entrar.',
    )
  })

  it('shows a wrong password as a root message, with no notice', async () => {
    post.mockRejectedValue(new ApiError('INVALID_CREDENTIALS'))

    submit('login')

    expect(
      await screen.findByText('El correo o la contraseña no son correctos.'),
    ).toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('shows any other failure as a notice', async () => {
    post.mockRejectedValue(new ApiError('NETWORK_ERROR'))

    submit('login')

    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce())
  })
})
