'use client'

import { useSearchParams } from 'next/navigation'
import { useCases } from '@/hooks/useCases'
import { ApiError } from '@/lib/api'
import { readFilters } from '@/lib/caseFilters'
import { CaseFilters } from './CaseFilters'
import {
  CaseListEmpty,
  CaseListError,
  CaseListSkeleton,
} from './CaseListStates'
import { CaseTable } from './CaseTable'

// RF-15 · the list: the filters from the address, then exactly one of loading, error,
// empty or the table
export function CaseList() {
  const filters = readFilters(useSearchParams())
  const cases = useCases(filters)

  return (
    <>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Mis casos</h1>
        <p className="mt-0.5 h-5 text-[13px] text-muted-foreground">
          {cases.data && countText(cases.data.total, filters.status)}
        </p>
      </div>

      <CaseFilters filters={filters} />

      <Body cases={cases} status={filters.status} />
    </>
  )
}

function Body({
  cases,
  status,
}: {
  cases: ReturnType<typeof useCases>
  status: ReturnType<typeof readFilters>['status']
}) {
  // A 401 is already sending the person to the login (TopBar): the error would only flash
  const signedOut =
    cases.error instanceof ApiError && cases.error.code === 'UNAUTHENTICATED'

  // Retrying after an error shows the skeleton, so the button visibly does something
  if (cases.isPending || signedOut || (cases.isError && cases.isFetching)) {
    return <CaseListSkeleton />
  }

  if (cases.isError) {
    const code =
      cases.error instanceof ApiError ? cases.error.code : 'INTERNAL_ERROR'
    return <CaseListError code={code} onRetry={() => cases.refetch()} />
  }

  const { items, total } = cases.data
  if (items.length === 0) return <CaseListEmpty status={status} />

  return (
    <>
      <CaseTable items={items} />
      {total > items.length && (
        <p className="text-center text-[13px] text-muted-foreground">
          Mostrando {items.length} de {total} casos.
        </p>
      )}
    </>
  )
}

function countText(
  total: number,
  status: ReturnType<typeof readFilters>['status'],
) {
  if (total === 0) return status ? 'Ningún caso' : 'Aún no hay casos'
  return total === 1 ? '1 caso' : `${total} casos`
}
