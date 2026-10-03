'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Case } from '@/lib/cases'
import { formatSize, formatWhen } from '@/lib/format'
import { FileIcon, StatusPill } from './CaseBadges'

// Mockup screen 3. The whole row opens the case; the title stays a real <a> for the keyboard.
// On a phone (screen 20) the date goes and the file shows as its icon alone.
export function CaseTable({ items }: { items: Case[] }) {
  const router = useRouter()

  return (
    <div className="overflow-x-auto rounded-[20px] border bg-card">
      <table className="w-full table-fixed text-sm sm:table-auto">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground *:px-4.5 *:py-3 *:font-semibold">
            <th>Caso</th>
            <th className="w-30 sm:w-auto">Estado</th>
            {/* On a phone the icons speak for themselves; the header stays for screen readers */}
            <th className="w-16 sm:w-auto">
              <span className="sr-only sm:not-sr-only">Evidencia</span>
            </th>
            <th className="hidden sm:table-cell">Actualizado</th>
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
              {/* wrap-anywhere: a title without spaces would stretch the column and push
                  the others out of the table */}
              <td className="px-4.5 py-3.5">
                <Link
                  href={`/cases/${item.id}`}
                  className="line-clamp-2 font-semibold wrap-anywhere"
                >
                  {item.title}
                </Link>
                <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground sm:max-w-[42ch]">
                  {item.description}
                </p>
              </td>
              <td className="px-4.5 py-3.5">
                <StatusPill status={item.status} />
              </td>
              <td className="px-4.5 py-3.5 text-right sm:text-left">
                <Evidence item={item} />
              </td>
              <td className="hidden px-4.5 py-3.5 text-[13px] whitespace-nowrap text-muted-foreground tabular-nums sm:table-cell">
                {formatWhen(item.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// On a phone the words are only for screen readers: a dash, or the file's icon
function Evidence({ item }: { item: Case }) {
  if (!item.fileName) {
    return (
      <span className="text-[13px] text-[#9aa0bb]">
        <span aria-hidden className="sm:hidden">
          —
        </span>
        <span className="sr-only sm:not-sr-only">Sin evidencia</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 text-[13px]">
      <FileIcon type={item.fileType} />
      <span className="sr-only sm:not-sr-only sm:max-w-[18ch] sm:truncate">
        {item.fileName}
      </span>
      {item.fileSize !== null && (
        <small className="hidden text-muted-foreground sm:inline">
          {formatSize(item.fileSize)}
        </small>
      )}
    </span>
  )
}
