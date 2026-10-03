'use client'

import { CircleAlert, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useDeleteCase } from '@/hooks/useCases'
import type { Case } from '@/lib/cases'
import { formatSize } from '@/lib/format'
import { successMessages } from '@/lib/messages.es'
import { notifySuccess } from '@/lib/notify'
import { FileIcon, StatusPill } from './CaseBadges'

// Names what is lost — the case and its file — and that it cannot be undone
// (RF-20 · mockup screen 16).
export function DeleteCaseDialog({
  item,
  open,
  onOpenChange,
}: {
  item: Case
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const remove = useDeleteCase(item.id)
  const hasFile = item.fileName !== null

  // On failure the dialog stays open: pressing Eliminar again is the retry
  const confirm = () =>
    remove.mutate(undefined, {
      onSuccess: () => {
        // The only change whose result is not on screen: the case is gone (RF-16)
        notifySuccess(successMessages.caseDeleted)
        router.push('/cases')
      },
    })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-4 rounded-[20px] p-6 sm:max-w-md">
        <span className="grid size-11 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="size-5" />
        </span>
        <AlertDialogTitle className="text-lg leading-snug font-extrabold tracking-tight">
          ¿Estás seguro de eliminar este caso?
        </AlertDialogTitle>

        <AlertDialogDescription asChild>
          <div className="grid gap-3 text-sm">
            {/* The case in miniature — status, title, description — so the person sees
                exactly which one goes. Pink, like the warning: this cannot be undone. */}
            <div className="grid gap-2.5 rounded-[14px] border border-destructive/20 bg-destructive/5 p-3.5">
              <div className="grid justify-items-start gap-1.5">
                <StatusPill status={item.status} />
                <p className="font-semibold wrap-anywhere text-foreground">
                  {item.title}
                </p>
                <p className="line-clamp-3 text-[13px] leading-relaxed wrap-anywhere text-slate">
                  {item.description}
                </p>
              </div>
              {hasFile && (
                <p className="flex items-center gap-2.5 border-t border-destructive/20 pt-2.5 text-[13px] wrap-anywhere text-foreground">
                  <FileIcon type={item.fileType} />
                  {item.fileName}
                  {item.fileSize !== null && `, ${formatSize(item.fileSize)}`}
                </p>
              )}
            </div>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-destructive">
              <CircleAlert className="size-4 shrink-0" />
              Se borrará definitivamente y no se puede deshacer.
            </p>
          </div>
        </AlertDialogDescription>

        <div className="flex justify-end gap-2.5">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {/* A plain button, not AlertDialogAction: that one closes the dialog on click,
              before the API has answered */}
          <Button
            variant="destructive"
            onClick={confirm}
            disabled={remove.isPending}
          >
            {hasFile ? 'Eliminar caso y archivo' : 'Eliminar caso'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
