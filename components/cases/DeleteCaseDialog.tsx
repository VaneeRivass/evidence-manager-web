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
import { type Case, useDeleteCase } from '@/hooks/useCases'
import { formatSize } from '@/lib/format'
import { notifyError, notifySuccess } from '@/lib/notify'
import { FileIcon, StatusPill } from './CaseBadges'

// RF-20 · mockup screen 16. Names what is lost — the case, by its own title and
// description, and its file when it has one — and says it cannot be undone. A generic
// "are you sure?" is not enough.
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

  const confirm = () =>
    remove.mutate(undefined, {
      onSuccess: () => {
        // The only change whose result is not on screen: the case is gone (RF-16)
        notifySuccess('Caso eliminado')
        router.push('/cases')
      },
      // The dialog stays open, so the person can try again or cancel
      onError: notifyError,
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
