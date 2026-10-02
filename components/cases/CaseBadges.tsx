import type { CaseStatus } from '@/lib/caseFilters'
import { fileLabel } from '@/lib/files'
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

// The mockup's file drawn as a document with a folded corner, its type on it (globals.css).
// Red for a PDF, teal for an image. `className` sizes it: the evidence panel draws it larger.
export function FileIcon({
  type,
  className,
}: {
  type: string | null
  className?: string
}) {
  const label = fileLabel(type)
  return (
    <span
      aria-hidden
      className={cn('file-icon', className)}
      data-kind={
        label && (type?.toLowerCase().startsWith('image/') ? 'image' : 'pdf')
      }
    >
      {label}
    </span>
  )
}
