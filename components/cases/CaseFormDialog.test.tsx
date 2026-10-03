import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Providers } from '@/app/providers'
import { api, ApiError } from '@/lib/api'
import type { Case } from '@/lib/cases'
import { CaseFormDialog } from './CaseFormDialog'

// RF-18 · RF-19 · the form shows its own errors: under the field, or else a notice. It
// stays open while saving, so the answer always has a form to land on.
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return { ...actual, api: { post: vi.fn(), patch: vi.fn() } }
})

vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sonner')>()
  return { ...actual, toast: { error: vi.fn(), success: vi.fn() } }
})

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

const post = vi.mocked(api.post)
const patch = vi.mocked(api.patch)

const existing: Case = {
  id: 'c1',
  title: 'Robo',
  description: 'Falta la denuncia.',
  status: 'OPEN',
  fileName: null,
  fileSize: null,
  fileType: null,
  createdAt: '2026-09-24T10:00:00.000Z',
  updatedAt: '2026-09-24T10:00:00.000Z',
}

function submitNewCase(onOpenChange = vi.fn()) {
  render(
    <Providers>
      <CaseFormDialog open onOpenChange={onOpenChange} />
    </Providers>,
  )
  fireEvent.change(screen.getByLabelText('Título'), {
    target: { value: 'Robo' },
  })
  fireEvent.change(screen.getByLabelText('Descripción'), {
    target: { value: 'Falta la denuncia.' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Crear caso' }))
}

describe('CaseFormDialog · a failed save', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a field error under its field, with no notice', async () => {
    post.mockRejectedValue(
      new ApiError('VALIDATION_ERROR', {}, [
        { field: 'title', code: 'TOO_LONG', params: { max: 120 } },
      ]),
    )

    submitNewCase()

    expect(
      await screen.findByText('Máximo 120 caracteres.'),
    ).toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('shows any other error as a notice with its code', async () => {
    post.mockRejectedValue(new ApiError('NETWORK_ERROR'))

    submitNewCase()

    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce())
  })

  it('cannot be closed while saving, so the answer finds it on screen', async () => {
    post.mockReturnValue(new Promise(() => {})) // an answer that never arrives
    const onOpenChange = vi.fn()
    submitNewCase(onOpenChange)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled(),
    )
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

// RF-16 · RF-19 · saving announces success, since the change is worth confirming
describe('CaseFormDialog · a successful save', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('announces «Caso creado» when it creates', async () => {
    post.mockResolvedValue({ ...existing, title: 'Robo' })

    submitNewCase()

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Caso creado'),
    )
  })

  it('announces «Cambios guardados» when it edits', async () => {
    patch.mockResolvedValue(existing)
    render(
      <Providers>
        <CaseFormDialog item={existing} open onOpenChange={vi.fn()} />
      </Providers>,
    )
    fireEvent.change(screen.getByLabelText('Descripción'), {
      target: { value: 'Otra descripción.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Cambios guardados'),
    )
  })
})
