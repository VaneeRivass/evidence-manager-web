'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Case } from '@/hooks/useCases'
import { formatSize, formatWhen } from '@/lib/format'
import { cn } from '@/lib/utils'

// Mockup screen 3. The whole row opens the case on click, which is what people expect of a
// list. The title stays a real <a>, so the keyboard and screen readers reach it too.
export function CaseTable({ items }: { items: Case[] }) {
  const router = useRouter()

  return (
    <div className="overflow-x-auto rounded-[20px] border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            {['Caso', 'Estado', 'Evidencia', 'Actualizado'].map((column) => (
              <th key={column} className="px-4.5 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              // A click on the title is the link's own; the row leaves it alone
              onClick={(event) => {
                if (!(event.target as HTMLElement).closest('a'))
                  router.push(`/cases/${item.id}`)
              }}
              className="cursor-pointer border-b last:border-b-0 hover:bg-[#fafbff]"
            >
              <td className="px-4.5 py-3.5">
                <Link href={`/cases/${item.id}`} className="font-semibold">
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
