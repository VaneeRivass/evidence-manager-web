import { CircleAlert } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// The mockup's fields: rounder than shadcn's default, on white. Inputs are taller; the
// textarea grows with its content.
export const fieldClass = 'rounded-[14px] bg-card px-3.5'
export const inputClass = cn(fieldClass, 'h-11')

// What ties an input to its error for screen readers: the input is marked invalid and
// points at the message below it
export const ariaFor = (id: string, error?: string) => ({
  'aria-invalid': !!error,
  'aria-describedby': error ? `${id}-error` : undefined,
})

// A label, its input and the error right under the field that caused it. `aside` sits at the
// label's right: a character count (RF-18).
export function FormField({
  id,
  label,
  error,
  aside,
  children,
}: {
  id: string
  label: string
  error?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="font-semibold">
          {label}
        </Label>
        {aside}
      </div>
      {children}
      <FieldError id={id} error={error} />
    </div>
  )
}

// The message under a field, with the id ariaFor points at. On its own for a field that is
// not a text input: the evidence's drop area (RF-18).
export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p
      id={`${id}-error`}
      className="flex items-center gap-1.5 text-[12.5px] wrap-anywhere text-destructive"
    >
      <CircleAlert className="size-3.5 shrink-0" />
      {error}
    </p>
  )
}
