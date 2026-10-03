import type { Metadata } from 'next'
import { CaseDetail } from '@/components/cases/CaseDetail'

export const metadata: Metadata = { title: 'Caso · Gestor de evidencias' }

// The case page. The id comes from the address; everything else is the client's, as on every
// private page (RF-16 · ADR-0007). In Next 15+ params arrive as a promise.
export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CaseDetail id={id} />
}
