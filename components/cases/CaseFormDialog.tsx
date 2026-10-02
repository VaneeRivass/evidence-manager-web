'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import {
  FormField,
  ariaFor,
  fieldClass,
  inputClass,
} from '@/components/FormField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { type Case, useSaveCase } from '@/hooks/useCases'
import { toApiError } from '@/lib/api'
import { placeFieldErrors } from '@/lib/formErrors'
import {
  CASE_FIELDS,
  type CaseInput,
  caseSchema,
  TITLE_MAX,
} from '@/lib/schemas'
import { cn } from '@/lib/utils'

// RF-16 · one dialog for creating (mockup screen 7) and editing (screen 15): without a case
// it creates, with one it edits. The status is not edited here.
export function CaseFormDialog({
  item,
  open,
  onOpenChange,
}: {
  item?: Case
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Editing has no description line: say so, as Radix asks, rather than leave it
        // looking for one. Creating keeps Radix's own wiring to DialogDescription.
        {...(item && { 'aria-describedby': undefined })}
        // No corner X: «Cancelar» and Esc already close it, and the X's built-in label
        // is in English
        showCloseButton={false}
        className="gap-5 rounded-[20px] p-6 sm:max-w-md"
      >
        {/* Inside the content, so the form mounts afresh on every opening */}
        <CaseForm item={item} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function CaseForm({ item, onDone }: { item?: Case; onDone: () => void }) {
  const router = useRouter()
  const mutation = useSaveCase(item)

  const form = useForm<CaseInput>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: item?.title ?? '',
      description: item?.description ?? '',
    },
  })
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form

  // useWatch, not watch(): the latter defeats React's compiler
  const [title, description] = useWatch({
    control,
    name: ['title', 'description'],
  })
  // Counted as the rule counts it: trimmed, in characters — an emoji is 1, though its
  // .length is 2 (lib/schemas.ts)
  const titleLength = [...title.trim()].length

  // RF-16 · compared as they would be sent — trimmed — so an added space is not a change.
  // An unchanged edit would still move the case to the top of the list.
  const unchanged =
    !!item &&
    title.trim() === item.title &&
    description.trim() === item.description

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      onSuccess: (saved) => {
        onDone()
        // RF-16 · creating opens the new case, where the evidence is attached
        if (!item) router.push(`/cases/${saved.id}`)
      },
      // Any other error is a notice, from the query client (providers.tsx)
      onError: (error) => {
        placeFieldErrors(toApiError(error), CASE_FIELDS, form)
      },
    }),
  )

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5">
      <div>
        <DialogTitle className="text-lg font-extrabold tracking-tight">
          {item ? 'Editar caso' : 'Nuevo caso'}
        </DialogTitle>
        {!item && (
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Podrás adjuntar la evidencia en el siguiente paso.
          </DialogDescription>
        )}
      </div>

      <FormField
        id="title"
        label="Título"
        error={errors.title?.message}
        aside={
          <span
            className={cn(
              'text-xs tabular-nums text-muted-foreground',
              titleLength > TITLE_MAX && 'text-destructive',
            )}
          >
            {titleLength} / {TITLE_MAX}
          </span>
        }
      >
        <Input
          id="title"
          autoComplete="off"
          {...ariaFor('title', errors.title?.message)}
          className={inputClass}
          {...register('title')}
        />
      </FormField>

      <FormField
        id="description"
        label="Descripción"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          rows={4}
          placeholder="Qué pasó, cuándo y a quién afecta…"
          {...ariaFor('description', errors.description?.message)}
          className={cn(fieldClass, 'min-h-28 py-2.5')}
          {...register('description')}
        />
      </FormField>

      <div className="flex justify-end gap-2.5">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={mutation.isPending || unchanged}>
          {item ? 'Guardar cambios' : 'Crear caso'}
        </Button>
      </div>
    </form>
  )
}
