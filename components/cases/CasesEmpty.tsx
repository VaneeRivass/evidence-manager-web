import { FolderOpen } from 'lucide-react'
import { StatePanel } from '@/components/common/StatePanel'
import type { CaseStatus } from '@/lib/cases'
import { NewCaseButton } from './NewCaseButton'

// Empty: says there is nothing and why. With a filter, it names it; without one, it offers
// to create the first case (RF-15 · mockup screen 5).
export function CasesEmpty({ status }: { status?: CaseStatus }) {
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
