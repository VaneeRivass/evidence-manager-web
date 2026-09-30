import { CloudOff, FolderOpen, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CaseStatus } from '@/lib/caseFilters'
import { message } from '@/lib/messages.es'

// RF-15 · the list is always one of these, or the table. Never a blank screen.

// Loading: the table's own shape, so nothing jumps when the data arrives (mockup screen 4).
// The word "loading" is only for screen readers.
export function CaseListSkeleton() {
  const rows = [
    [220, 300, 150],
    [190, 260, 130],
    [240, 280, 90],
  ]
  return (
    <div
      role="status"
      aria-label="Cargando casos"
      className="overflow-hidden rounded-[20px] border bg-card"
    >
      <div className="flex gap-4.5 border-b px-4.5 py-3 text-xs font-semibold text-muted-foreground">
        <span className="flex-1">Caso</span>
        <span className="w-24">Estado</span>
        <span className="w-40">Evidencia</span>
        <span className="w-20">Actualizado</span>
      </div>
      {rows.map(([title, description, file], i) => (
        <div
          key={i}
          className="flex items-center gap-4.5 border-b px-4.5 py-4 last:border-b-0"
        >
          <span className="grid flex-1 gap-2">
            <Bar width={title} />
            <Bar width={description} height={9} />
          </span>
          <span className="w-24">
            <Bar width={70} height={20} />
          </span>
          <span className="w-40">
            <Bar width={file} />
          </span>
          <span className="w-20">
            <Bar width={60} />
          </span>
        </div>
      ))}
    </div>
  )
}

function Bar({ width, height = 12 }: { width: number; height?: number }) {
  return (
    <span
      className="block max-w-full rounded-full bg-muted motion-safe:animate-pulse"
      style={{ width, height }}
    />
  )
}

// Empty: says there is nothing and why (mockup screen 5). With a filter, it names it.
// The button to create the first case arrives with creation, in #7.
export function CaseListEmpty({ status }: { status?: CaseStatus }) {
  const filtered = status !== undefined
  return (
    <StatePanel
      icon={<FolderOpen className="size-7" />}
      tone="primary"
      title={
        filtered
          ? `No tienes casos ${status === 'OPEN' ? 'abiertos' : 'cerrados'}`
          : 'Todavía no tienes casos'
      }
      text={
        filtered
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
      icon={<CloudOff className="size-7" />}
      tone="destructive"
      title="No pudimos cargar tus casos"
      text={
        code === 'NETWORK_ERROR'
          ? 'Parece un problema de conexión. Tus datos están a salvo; vuelve a intentarlo.'
          : message(code)
      }
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

function StatePanel({
  icon,
  tone,
  title,
  text,
  children,
}: {
  icon: React.ReactNode
  tone: 'primary' | 'destructive'
  title: string
  text: string
  children?: React.ReactNode
}) {
  return (
    <section className="grid justify-items-center gap-2.5 rounded-[20px] border bg-card px-6 py-14 text-center">
      <span
        className={`mb-1.5 grid size-16 place-items-center rounded-[20px] ${
          tone === 'primary'
            ? 'bg-secondary text-primary'
            : 'bg-destructive/10 text-destructive'
        }`}
      >
        {icon}
      </span>
      <h2 className="text-[17px] font-bold">{title}</h2>
      <p className="max-w-[46ch] text-sm text-muted-foreground">{text}</p>
      {children}
    </section>
  )
}
