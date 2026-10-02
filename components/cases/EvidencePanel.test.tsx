import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Case } from '@/hooks/useCases'
import { api, uploadToStorage } from '@/lib/api'
import { EvidencePanel } from './EvidencePanel'

// RF-17 · a wrong file is rejected in the browser, before any request. Every way out of
// the browser is substituted, so "no request" means none of them was called.
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn() },
    uploadToStorage: vi.fn(),
  }
})

const caseWithoutFile: Case = {
  id: 'c1',
  title: 'Pérdida de portátil en viaje',
  description: 'Falta adjuntar la denuncia.',
  status: 'OPEN',
  fileName: null,
  fileSize: null,
  fileType: null,
  createdAt: '2026-09-24T10:00:00.000Z',
  updatedAt: '2026-09-24T10:00:00.000Z',
}

const MB = 1024 * 1024

// A File whose size is declared without allocating it
function fileOf(name: string, type: string, size: number) {
  const file = new File([], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

function choose(file: File) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <EvidencePanel item={caseWithoutFile} />
    </QueryClientProvider>,
  )
  fireEvent.change(screen.getByLabelText('Elegir el archivo de evidencia'), {
    target: { files: [file] },
  })
}

function expectNoRequest() {
  expect(api.post).not.toHaveBeenCalled()
  expect(api.get).not.toHaveBeenCalled()
  expect(uploadToStorage).not.toHaveBeenCalled()
}

describe('EvidencePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects a type outside the allowlist without calling the API', () => {
    choose(fileOf('video-camara.mp4', 'video/mp4', 2 * MB))

    expect(
      screen.getByText(
        '«video-camara.mp4» no se puede adjuntar: solo se admiten PDF, JPG o PNG.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Adjuntar' }),
    ).not.toBeInTheDocument()
    expectNoRequest()
  })

  it('rejects a file over the size limit without calling the API', () => {
    choose(fileOf('escaneo-completo.pdf', 'application/pdf', 8.2 * MB))

    expect(
      screen.getByText(
        '«escaneo-completo.pdf» pesa 8,2 MB y el máximo es 5 MB.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Adjuntar' }),
    ).not.toBeInTheDocument()
    expectNoRequest()
  })
})
