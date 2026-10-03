import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, uploadToStorage } from '@/lib/api'
import type { Case } from '@/lib/cases'
import { useFileUpload } from './useFileUpload'

// RF-17 · three calls, one action. The client is substituted: what is under test is the
// order of the calls and what the upload leaves in the cache, not the network.
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    api: { post: vi.fn() },
    uploadToStorage: vi.fn(),
  }
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

function Harness({ onDone }: { onDone: () => void }) {
  const { attach, progress } = useFileUpload('c1')
  const file = new File(['abc'], 'denuncia.pdf', { type: 'application/pdf' })

  return (
    <button onClick={() => attach(file, onDone)}>
      Adjuntar {Math.round(progress * 100)}
    </button>
  )
}

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
    fireEvent.click(screen.getByRole('button', { name: /Adjuntar/ }))

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
    // The dialog's case is the API's answer, so the page does not go stale
    expect(client.getQueryData(['case', 'c1'])).toEqual(uploaded)
  })
})
