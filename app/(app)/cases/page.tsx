import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CaseList } from '@/components/cases/CaseList'
import { CaseListSkeleton } from '@/components/cases/CaseListStates'

export const metadata: Metadata = { title: 'Mis casos · Gestor de evidencias' }

// CaseList reads the address (useSearchParams), which only exists in the browser: Next
// needs a Suspense boundary around it, and shows the fallback until then
export default function CasesPage() {
  return (
    <Suspense fallback={<CaseListSkeleton />}>
      <CaseList />
    </Suspense>
  )
}
