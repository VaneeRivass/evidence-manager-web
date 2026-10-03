'use client'

import { useSearchParams } from 'next/navigation'
import { LoadError } from '@/components/common/LoadError'
import { useCases } from '@/hooks/useCases'
import { toApiError } from '@/lib/api'
import { readFilters } from '@/lib/caseFilters'
import type { CaseStatus } from '@/lib/cases'
import { CaseFilters } from './CaseFilters'
import { CaseTable } from './CaseTable'
import { CaseTableSkeleton } from './CaseTableSkeleton'
import { CasesEmpty } from './CasesEmpty'
import { NewCaseButton } from './NewCaseButton'

// The list: the filters from the address, then exactly one of loading, error, empty or the
// table (RF-15).
export function CaseList() {
  const filters = readFilters(useSearchParams())
  const cases = useCases(filters)
  // With no case at all, the empty state's «Crear mi primer caso» is the only button for it
  // (mockup screen 5). A filtered empty list offers none, so the header keeps its own.
  const firstCase = cases.data?.total === 0 && !filters.status

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Mis casos</h1>
          <p className="mt-0.5 h-5 text-[13px] text-muted-foreground">
            {cases.data && countText(cases.data.total, filters.status)}
          </p>
        </div>
        {!firstCase && <NewCaseButton>Nuevo caso</NewCaseButton>}
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
  status: CaseStatus | undefined
}) {
  // Retrying after an error shows the skeleton, so the button visibly does something
  if (cases.isPending || (cases.isError && cases.isFetching)) {
    return <CaseTableSkeleton />
  }

  if (cases.isError) {
    return (
      <LoadError
        title="No pudimos cargar tus casos"
        code={toApiError(cases.error).code}
        onRetry={() => cases.refetch()}
      />
    )
  }

  const { items, total } = cases.data
  if (items.length === 0) return <CasesEmpty status={status} />

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

function countText(total: number, status: CaseStatus | undefined) {
  if (total === 0) return status ? 'Ningún caso' : 'Aún no hay casos'
  return total === 1 ? '1 caso' : `${total} casos`
}
