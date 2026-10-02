'use client'

import {
  ArrowLeft,
  LockKeyhole,
  LockKeyholeOpen,
  Pencil,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { LoadError } from '@/components/LoadError'
import { NotFoundScreen } from '@/components/NotFoundScreen'
import { SkeletonBar } from '@/components/SkeletonBar'
import { Button } from '@/components/ui/button'
import { type Case, useCase, useCaseStatus } from '@/hooks/useCases'
import { isNotFound, toApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { StatusPill } from './CaseBadges'
import { CaseFormDialog } from './CaseFormDialog'
import { DeleteCaseDialog } from './DeleteCaseDialog'
import { EvidencePanel } from './EvidencePanel'

// The cards and their skeletons share one shape, so they cannot drift apart
const cardClass = 'grid gap-4 rounded-[20px] border bg-card p-6'
// The case on the left, its evidence on the right — stacked on a phone (mockup screen 8)
const columnsClass = 'grid items-start gap-5 lg:grid-cols-[1.45fr_1fr]'

// RF-16 · RF-17 · the case page (mockup screens 8 to 14)
export function CaseDetail({ id }: { id: string }) {
  const query = useCase(id)
  // Gone is gone, even if an earlier answer is still cached
  if (isNotFound(query.error)) {
    return (
      <NotFoundScreen
        title="No encontramos este caso"
        text="Puede que se haya eliminado o que la dirección no sea correcta. Tus demás casos siguen donde los dejaste."
      />
    )
  }

  // A case already on screen stays there when a background refresh fails — returning to the
  // tab during a network blip must not take away the case, or an edit being typed
  if (query.data) return <CaseCard item={query.data} />

  if (query.isError && !query.isFetching) {
    return (
      <LoadError
        title="No pudimos cargar el caso"
        code={toApiError(query.error).code}
        onRetry={() => query.refetch()}
      />
    )
  }

  return <CaseSkeleton />
}

function CaseCard({ item }: { item: Case }) {
  const status = useCaseStatus(item.id)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const open = item.status === 'OPEN'

  // RF-08 · closing and reopening: no confirmation, it can be undone
  const toggleStatus = () => status.mutate(open ? 'CLOSED' : 'OPEN')

  return (
    <>
      <Link
        href="/cases"
        className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Mis casos
      </Link>

      <div className={columnsClass}>
        <article className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusPill status={item.status} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={toggleStatus}
                disabled={status.isPending}
              >
                {open ? <LockKeyhole /> : <LockKeyholeOpen />}
                {open ? 'Cerrar caso' : 'Reabrir'}
              </Button>
              <Button
                variant="destructive-outline"
                onClick={() => setDeleting(true)}
              >
                <Trash2 />
                Eliminar
              </Button>
            </div>
          </div>

          <h1 className="text-2xl leading-tight font-extrabold tracking-tight wrap-anywhere">
            {item.title}
          </h1>
          {/* pre-line keeps the line breaks the person typed */}
          <p className="max-w-[70ch] whitespace-pre-line wrap-anywhere text-slate">
            {item.description}
          </p>

          <p className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted-foreground">
            <span>
              Creado{' '}
              <b className="font-semibold text-foreground">
                {formatDate(item.createdAt)}
              </b>
            </span>
            <span>
              Actualizado{' '}
              <b className="font-semibold text-foreground">
                {formatDate(item.updatedAt)}
              </b>
            </span>
          </p>
        </article>

        <section aria-labelledby="evidence-title" className={cardClass}>
          <h2 id="evidence-title" className="text-[15px] font-bold">
            Evidencia
          </h2>
          <EvidencePanel item={item} />
        </section>
      </div>

      <CaseFormDialog item={item} open={editing} onOpenChange={setEditing} />
      <DeleteCaseDialog
        item={item}
        open={deleting}
        onOpenChange={setDeleting}
      />
    </>
  )
}

// The card's own shape, so nothing jumps when the case arrives (RF-15's rule, applied here)
function CaseSkeleton() {
  return (
    <div role="status" aria-label="Cargando caso" className={columnsClass}>
      <div className={cardClass}>
        <SkeletonBar className="h-6 w-20" />
        <SkeletonBar className="h-7 w-2/3" />
        <SkeletonBar className="h-3 w-full" />
        <SkeletonBar className="h-3 w-4/5" />
      </div>
      <div className={cardClass}>
        <SkeletonBar className="h-4 w-24" />
        <SkeletonBar className="h-40 w-full rounded-[18px]" />
      </div>
    </div>
  )
}
