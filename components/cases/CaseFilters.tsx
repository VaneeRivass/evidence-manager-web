'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CaseStatus } from '@/lib/cases'
import {
  type CaseListFilters,
  type CaseSort,
  casesHref,
} from '@/lib/caseFilters'
import { cn } from '@/lib/utils'

const tabs: { label: string; status?: CaseStatus }[] = [
  { label: 'Todos' },
  { label: 'Abiertos', status: 'OPEN' },
  { label: 'Cerrados', status: 'CLOSED' },
]

const sorts: { label: string; value: CaseSort }[] = [
  { label: 'Última actualización', value: 'updatedAt' },
  { label: 'Fecha de creación', value: 'createdAt' },
]

// The tabs are links and the ordering rewrites the address: the address is where the filters
// live, so reloading or going back keeps them (RF-06).
export function CaseFilters({ filters }: { filters: CaseListFilters }) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav
        aria-label="Filtrar por estado"
        className="inline-flex gap-0.5 rounded-full border bg-card p-1"
      >
        {tabs.map((tab) => {
          const active = tab.status === filters.status
          return (
            <Link
              key={tab.label}
              href={casesHref({ ...filters, status: tab.status })}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[13px] font-medium',
                active
                  ? 'bg-foreground text-white'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <Select
        value={filters.sort}
        onValueChange={(sort) =>
          router.replace(casesHref({ ...filters, sort: sort as CaseSort }), {
            scroll: false,
          })
        }
      >
        <SelectTrigger
          aria-label="Ordenar por"
          className="h-9 rounded-full bg-card px-3.5 text-[13px] text-slate"
        >
          {/* The label is given, not looked up: Radix fills an empty SelectValue only once
              the page's JavaScript has loaded, which leaves the pill blank until then */}
          <SelectValue>
            {sorts.find((sort) => sort.value === filters.sort)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {sorts.map((sort) => (
            <SelectItem key={sort.value} value={sort.value}>
              {sort.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
