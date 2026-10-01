import { FolderOpen } from 'lucide-react'
import { SkeletonBar } from '@/components/SkeletonBar'
import { StatePanel } from '@/components/StatePanel'
import type { CaseStatus } from '@/lib/caseFilters'
import { NewCaseButton } from './NewCaseButton'

// RF-15 · the list is always one of these, or the table. Never a blank screen.

// Loading: rows the height of the table's, so nothing jumps when the data arrives
// (mockup screen 4). The word "loading" is only for screen readers.
export function CaseListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando casos"
      className="overflow-hidden rounded-[20px] border bg-card"
    >
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className="grid gap-2 border-b px-4.5 py-4 last:border-b-0"
        >
          <SkeletonBar className="h-3 w-56" />
          <SkeletonBar className="h-2.5 w-80" />
        </div>
      ))}
    </div>
  )
}

// Empty: says there is nothing and why (mockup screen 5). With a filter, it names it;
// without one, it offers to create the first case (RF-15).
export function CaseListEmpty({ status }: { status?: CaseStatus }) {
  return (
    <StatePanel
      icon={<FolderOpen />}
      tone="primary"
      title={
        status
          ? `No tienes casos ${status === 'OPEN' ? 'abiertos' : 'cerrados'}`
          : 'Todavía no tienes casos'
      }
      text={
        status
          ? 'Cambia el filtro para ver el resto de tus casos.'
          : 'Crea un caso para registrar una incidencia. Después podrás adjuntarle el archivo que la respalda.'
      }
    >
      {!status && (
        <div className="mt-2">
          <NewCaseButton>Crear mi primer caso</NewCaseButton>
        </div>
      )}
    </StatePanel>
  )
}
