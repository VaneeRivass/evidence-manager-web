import type { CaseStatus } from '@/lib/caseFilters'
import { cn } from '@/lib/utils'

export function StatusPill({ status }: { status: CaseStatus }) {
  const open = status === 'OPEN'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold before:size-1.5 before:rounded-full before:bg-current',
        open
          ? 'bg-secondary text-secondary-foreground'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {open ? 'Abierto' : 'Cerrado'}
    </span>
  )
}

const kinds: Record<string, { label: string; kind: 'pdf' | 'image' }> = {
  'application/pdf': { label: 'PDF', kind: 'pdf' },
  'image/png': { label: 'PNG', kind: 'image' },
  'image/jpeg': { label: 'JPG', kind: 'image' },
}

// The mockup's file drawn as a document with a folded corner, its type on it (globals.css)
export function FileIcon({ type }: { type: string | null }) {
  const known = kinds[type ?? '']
  return (
    <span aria-hidden className="file-icon" data-kind={known?.kind}>
      {known?.label}
    </span>
  )
}
