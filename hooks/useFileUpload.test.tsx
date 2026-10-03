import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Providers } from '@/app/providers'
import { api, ApiError, uploadToStorage } from '@/lib/api'
import type { Case } from '@/lib/cases'
import { useFileUpload } from './useFileUpload'

// RF-17 · three calls, one action. The client is substituted: what is under test is the
// order of the calls, the cache the upload leaves behind, and the notice a failure shows.
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    api: { post: vi.fn() },
    uploadToStorage: vi.fn(),
  }
})

vi.mock('sonner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('sonner')>()
  return { ...actual, toast: { error: vi.fn(), success: vi.fn() } }
})

const post = vi.mocked(api.post)
const store = vi.mocked(uploadToStorage)

const uploaded: Case = {
  id: 'c1',
  title: 'Robo de bicicleta',
  description: 'Falta la denuncia.',
  status: 'OPEN',
  fileName: 'denuncia.pdf',
  fileSize: 1024,
  fileType: 'application/pdf',
  createdAt: '2026-09-24T10:00:00.000Z',
  updatedAt: '2026-09-24T10:00:00.000Z',
}

function Harness({ onDone = vi.fn() }: { onDone?: () => void }) {
  const { attach, progress } = useFileUpload('c1')
  const file = new File(['abc'], 'denuncia.pdf', { type: 'application/pdf' })

  return (
    <button onClick={() => attach(file, onDone)}>
      Adjuntar {Math.round(progress * 100)}
    </button>
  )
}

const press = () =>
  fireEvent.click(screen.getByRole('button', { name: /Adjuntar/ }))

const notice = () => vi.mocked(toast.error).mock.calls[0]?.[0]

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useFileUpload · a successful upload', () => {
  it('asks for a link, sends the file to storage, confirms, and caches the case', async () => {
    post
      .mockResolvedValueOnce({ uploadUrl: 'https://storage/x', key: 'k1' })
      .mockResolvedValueOnce(uploaded)
    store.mockImplementation(async (_url, _file, onProgress) => {
      onProgress(0.5)
      onProgress(1)
    })
    const onDone = vi.fn()
    const client = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <Harness onDone={onDone} />
      </QueryClientProvider>,
    )
    press()

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce())

    expect(post).toHaveBeenNthCalledWith(1, '/cases/c1/file/upload-url', {
      fileName: 'denuncia.pdf',
      contentType: 'application/pdf',
      size: 3,
    })
    expect(store).toHaveBeenCalledOnce()
    expect(post).toHaveBeenNthCalledWith(2, '/cases/c1/file/complete', {
      key: 'k1',
    })
    expect(client.getQueryData(['case', 'c1'])).toEqual(uploaded)
  })
})

// RF-19 · the notice is not the hook's: providers.tsx shows it for every failed action that
// is not a form. These tests render inside the real Providers to prove it reaches the person.
describe('useFileUpload · a failed upload', () => {
  function renderInApp() {
    render(
      <Providers>
        <Harness />
      </Providers>,
    )
  }

  it('shows the connection notice when offline: the API is never reached', async () => {
    post.mockRejectedValue(new ApiError('NETWORK_ERROR'))

    renderInApp()
    press()

    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce())
    expect(notice()).toMatch(/No pudimos conectar con el servidor/)
  })

  it('shows UPLOAD_FAILED when storage itself rejects the file', async () => {
    post.mockResolvedValueOnce({ uploadUrl: 'https://storage/x', key: 'k1' })
    store.mockRejectedValue(new ApiError('UPLOAD_FAILED'))

    renderInApp()
    press()

    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce())
    expect(notice()).toMatch(/La subida se interrumpió/)
  })

  it('shows FILE_ALREADY_ATTACHED when the API refuses to replace the file', async () => {
    post
      .mockResolvedValueOnce({ uploadUrl: 'https://storage/x', key: 'k1' })
      .mockRejectedValueOnce(new ApiError('FILE_ALREADY_ATTACHED'))
    store.mockResolvedValue(undefined)

    renderInApp()
    press()

    await waitFor(() => expect(toast.error).toHaveBeenCalledOnce())
    expect(notice()).toMatch(/ya tiene un archivo/)
  })
})
