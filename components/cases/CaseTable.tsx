import Link from 'next/link'
import type { Case } from '@/hooks/useCases'
import { formatSize, formatWhen } from '@/lib/format'

// Mockup screen 3. Each row leads to the case: the title is the link, stretched over the
// whole row so the row is clickable and the keyboard still reaches one real <a>.
export function CaseTable({ items }: { items: Case[] }) {
  return (
    <div className="overflow-x-auto rounded-[20px] border bg-card">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-semibold text-muted-foreground">
            <th className="px-4.5 py-3 font-semibold">Caso</th>
            <th className="px-4.5 py-3 font-semibold">Estado</th>
            <th className="px-4.5 py-3 font-semibold">Evidencia</th>
            <th className="px-4.5 py-3 font-semibold">Actualizado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="relative border-b last:border-b-0 hover:bg-[#fafbff]"
            >
              <td className="px-4.5 py-3.5">
                <Link
                  href={`/cases/${item.id}`}
                  className="font-semibold after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-[20px] focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                >
                  {item.title}
                </Link>
                <p className="mt-0.5 max-w-[42ch] truncate text-[12.5px] text-muted-foreground">
                  {item.description}
                </p>
              </td>
              <td className="px-4.5 py-3.5">
                <StatusPill status={item.status} />
              </td>
              <td className="px-4.5 py-3.5">
                <Evidence item={item} />
              </td>
              <td className="px-4.5 py-3.5 text-[13px] whitespace-nowrap text-muted-foreground tabular-nums">
                {formatWhen(item.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusPill({ status }: { status: Case['status'] }) {
  const open = status === 'OPEN'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold before:size-1.5 before:rounded-full before:bg-current ${
        open
          ? 'bg-secondary text-secondary-foreground'
          : 'bg-muted text-muted-foreground'
      }`}
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

function Evidence({ item }: { item: Case }) {
  if (!item.fileName) {
    return <span className="text-[13px] text-[#9aa0bb]">Sin evidencia</span>
  }

  const type = kinds[item.fileType ?? '']
  return (
    <span className="inline-flex items-center gap-2 text-[13px]">
      <span aria-hidden className="file-icon" data-kind={type?.kind}>
        {type?.label}
      </span>
      <span className="max-w-[18ch] truncate">{item.fileName}</span>
      {item.fileSize !== null && (
        <small className="text-muted-foreground">
          {formatSize(item.fileSize)}
        </small>
      )}
    </span>
  )
}
