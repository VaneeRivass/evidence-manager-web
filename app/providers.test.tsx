import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSaveCase } from '@/hooks/useCases'
import { api, ApiError } from '@/lib/api'
import { Providers } from './providers'

// RF-19 · every failed action gets its notice from one place. A form only says which errors
// it places itself; the rest are notices — even once the form has closed, the case the
// review of #9 found.
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return { ...actual, api: { post: vi.fn() } }
})

vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sonner')>()
  return { ...actual, toast: { error: vi.fn(), success: vi.fn() } }
})

const post = vi.mocked(api.post)

// The new-case form, reduced to its button: the same mutation, with its meta
function SaveButton() {
  const save = useSaveCase()
  return (
    <button onClick={() => save.mutate({ title: 'Robo', description: 'x' })}>
      Crear caso
    </button>
  )
}

function save() {
  const view = render(
    <Providers>
      <SaveButton />
    </Providers>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Crear caso' }))
  return view
}

describe('Providers · the notice for a failed action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the code when the request fails', async () => {
    post.mockRejectedValue(new ApiError('NETWORK_ERROR'))

    save()

    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce())
    expect(vi.mocked(toast.error).mock.calls[0][0]).toMatch(
      /No pudimos conectar con el servidor/,
    )
  })

  it('stays quiet for an error the form places under its field', async () => {
    post.mockRejectedValue(
      new ApiError('VALIDATION_ERROR', {}, [
        { field: 'title', code: 'TOO_LONG' },
      ]),
    )

    save()
    await waitFor(() => expect(post).toHaveBeenCalled())
    await act(async () => {})

    expect(toast.error).not.toHaveBeenCalled()
  })

  it('still shows it when the form closed before the answer arrived', async () => {
    const answer = Promise.withResolvers<never>()
    post.mockReturnValue(answer.promise)

    const view = save()
    // Cancelar while the request is on its way: the form is gone
    view.rerender(<Providers>{null}</Providers>)
    await act(async () => answer.reject(new ApiError('NETWORK_ERROR')))

    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce())
  })
})
