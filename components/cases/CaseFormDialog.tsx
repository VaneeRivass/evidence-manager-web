'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import {
  FormField,
  ariaFor,
  fieldClass,
  inputClass,
} from '@/components/common/FormField'
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
import { useSaveCase } from '@/hooks/useCases'
import type { Case } from '@/lib/cases'
import { showFieldErrors } from '@/lib/formErrors'
import { notifyError } from '@/lib/notify'
import {
  CASE_FIELDS,
  type CaseInput,
  caseSchema,
  DESCRIPTION_MAX,
  characterCount,
  TITLE_MAX,
} from '@/lib/schemas'
import { cn } from '@/lib/utils'

// One dialog for creating and editing: without a case it creates, with one it edits. The
// status is not edited here (RF-16 · mockup screens 7 and 15).
export function CaseFormDialog({
  item,
  open,
  onOpenChange,
}: {
  item?: Case
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const save = useSaveCase(item)

  return (
    // Locked while saving: the answer always finds the form on screen (Esc and a click
    // outside are ignored; Cancelar is disabled)
    <Dialog
      open={open}
      onOpenChange={(next) => !save.isPending && onOpenChange(next)}
    >
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
        <CaseForm item={item} save={save} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function CaseForm({
  item,
  save,
  onDone,
}: {
  item?: Case
  save: ReturnType<typeof useSaveCase>
  onDone: () => void
}) {
  const router = useRouter()

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
  // Compared as they would be sent — trimmed — so an added space is not a change. An
  // unchanged edit would still move the case to the top of the list (RF-16).
  const unchanged =
    !!item &&
    title.trim() === item.title &&
    description.trim() === item.description

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = await save.mutateAsync(values)
      onDone()
      // Creating opens the new case, where the evidence is attached (RF-16)
      if (!item) router.push(`/cases/${saved.id}`)
    } catch (error) {
      if (!showFieldErrors(error, CASE_FIELDS, form)) notifyError(error)
    }
  })

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
        aside={<CharCount value={title} max={TITLE_MAX} />}
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
        aside={<CharCount value={description} max={DESCRIPTION_MAX} />}
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
          <Button type="button" variant="outline" disabled={save.isPending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={save.isPending || unchanged}>
          {item ? 'Guardar cambios' : 'Crear caso'}
        </Button>
      </div>
    </form>
  )
}

// Counted as the rule counts it (lib/schemas.ts); red past the limit (RF-16)
function CharCount({ value, max }: { value: string; max: number }) {
  const count = characterCount(value.trim())
  return (
    <span
      className={cn(
        'text-xs tabular-nums text-muted-foreground',
        count > max && 'text-destructive',
      )}
    >
      {count} / {max}
    </span>
  )
}
