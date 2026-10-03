import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Case } from '@/lib/cases'
import { api, ApiError } from '@/lib/api'
import { CaseList } from './CaseList'

// RF-15 · the list in its three states, and with cases. The API client is substituted:
// what is under test is what the screen shows for each answer, not the network.
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return { ...actual, api: { get: vi.fn() } }
})

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}))

const get = vi.mocked(api.get)

function renderList() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <CaseList />
    </QueryClientProvider>,
  )
}

describe('CaseList', () => {
  // Braces on purpose: mockReset returns the mock, and a function returned from beforeEach
  // is run by Vitest as teardown — it would call the API mock once more after each test
  beforeEach(() => {
    get.mockReset()
  })

  it('shows a skeleton, not the word, while the list is on its way', () => {
    get.mockReturnValue(new Promise(() => {}))

    renderList()

    expect(
      screen.getByRole('status', { name: 'Cargando casos' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument()
  })

  it('says there are no cases yet when the list is empty', async () => {
    get.mockResolvedValue({ items: [], total: 0 })

    renderList()

    expect(
      await screen.findByText('Todavía no tienes casos'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows each case in the table, with how many there are', async () => {
    const item = {
      description: 'Descripción',
      status: 'OPEN',
      fileName: null,
      fileSize: null,
      fileType: null,
      createdAt: '2026-09-24T10:00:00.000Z',
      updatedAt: '2026-09-24T10:00:00.000Z',
    } satisfies Omit<Case, 'id' | 'title'>
    get.mockResolvedValue({
      items: [
        { ...item, id: '1', title: 'Cargo duplicado en la tarjeta' },
        { ...item, id: '2', title: 'Robo de bicicleta', status: 'CLOSED' },
      ],
      total: 2,
    })

    renderList()

    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(
      screen.getByText('Cargo duplicado en la tarjeta'),
    ).toBeInTheDocument()
    expect(screen.getByText('Robo de bicicleta')).toBeInTheDocument()
    expect(screen.getByText('2 casos')).toBeInTheDocument()
  })

  it('shows the error code and asks again on retry', async () => {
    get.mockRejectedValue(new ApiError('NETWORK_ERROR'))

    renderList()

    expect(
      await screen.findByText('No pudimos cargar tus casos'),
    ).toBeInTheDocument()
    expect(screen.getByText('NETWORK_ERROR')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(get).toHaveBeenCalledTimes(2)
  })
})
