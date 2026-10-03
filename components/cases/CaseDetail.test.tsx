import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError } from '@/lib/api'
import type { Case } from '@/lib/cases'
import { CaseDetail } from './CaseDetail'

// RF-15 · RF-16 · the case page in its states: loading, the case, not found and an error.
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
    uploadToStorage: vi.fn(),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

const get = vi.mocked(api.get)

const item: Case = {
  id: 'c1',
  title: 'Robo de bicicleta',
  description: 'Falta la denuncia.',
  status: 'OPEN',
  fileName: null,
  fileSize: null,
  fileType: null,
  createdAt: '2026-09-24T10:00:00.000Z',
  updatedAt: '2026-09-24T10:00:00.000Z',
}

function renderDetail() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <CaseDetail id="c1" />
    </QueryClientProvider>,
  )
}

describe('CaseDetail', () => {
  beforeEach(() => {
    get.mockReset()
  })

  it('shows a skeleton while the case is on its way', () => {
    get.mockReturnValue(new Promise(() => {}))

    renderDetail()

    expect(
      screen.getByRole('status', { name: 'Cargando caso' }),
    ).toBeInTheDocument()
  })

  it('shows the case once it arrives', async () => {
    get.mockResolvedValue(item)

    renderDetail()

    expect(await screen.findByText('Robo de bicicleta')).toBeInTheDocument()
    expect(screen.getByText('Falta la denuncia.')).toBeInTheDocument()
  })

  it('says the case is not there when the API does not have it', async () => {
    get.mockRejectedValue(new ApiError('CASE_NOT_FOUND'))

    renderDetail()

    expect(
      await screen.findByText('No encontramos este caso'),
    ).toBeInTheDocument()
  })

  it('shows the error state and its code when the load fails', async () => {
    get.mockRejectedValue(new ApiError('NETWORK_ERROR'))

    renderDetail()

    expect(
      await screen.findByText('No pudimos cargar el caso'),
    ).toBeInTheDocument()
    expect(screen.getByText('NETWORK_ERROR')).toBeInTheDocument()
  })
})
