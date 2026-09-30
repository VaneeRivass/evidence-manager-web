import { CloudOff, FolderOpen, RotateCw } from 'lucide-react'
import { StatePanel } from '@/components/StatePanel'
import { Button } from '@/components/ui/button'
import type { CaseStatus } from '@/lib/caseFilters'
import { message } from '@/lib/messages.es'

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
          <span className="h-3 w-56 max-w-full rounded-full bg-muted motion-safe:animate-pulse" />
          <span className="h-2.5 w-80 max-w-full rounded-full bg-muted motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// Empty: says there is nothing and why (mockup screen 5). With a filter, it names it.
// The button to create the first case arrives with creation, in #7.
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
    />
  )
}

// Error: the API's code in view and a way to try again (mockup screen 6)
export function CaseListError({
  code,
  onRetry,
}: {
  code: string
  onRetry: () => void
}) {
  return (
    <StatePanel
      icon={<CloudOff />}
      tone="destructive"
      title="No pudimos cargar tus casos"
      text={message(code)}
    >
      <code className="rounded-md bg-muted px-2 py-0.5 text-[11.5px] text-slate">
        {code}
      </code>
      <Button variant="outline" onClick={onRetry} className="mt-2 rounded-full">
        <RotateCw />
        Reintentar
      </Button>
    </StatePanel>
  )
}
