'use client'

import { CloudUpload } from 'lucide-react'
import { useState } from 'react'
import { ariaFor, FieldError } from '@/components/FormField'
import { ALLOWED_FILES, FILE_ACCEPT, MAX_FILE_BYTES } from '@/lib/files'
import { formatSize } from '@/lib/format'
import { cn } from '@/lib/utils'

const INPUT_ID = 'evidence-file'

// Mockup screens 8 and 12 · no file yet. A <label> around a real file input, so a click or
// Enter opens the picker; a dropped file arrives through the same `onFile`.
export function EvidenceDropArea({
  onFile,
  error,
}: {
  onFile: (file: File | undefined) => void
  error?: string
}) {
  const [over, setOver] = useState(false)

  return (
    <div className="grid gap-2">
      <label
        htmlFor={INPUT_ID}
        onDragOver={(event) => {
          event.preventDefault() // without it the browser opens the file instead
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setOver(false)
          onFile(event.dataTransfer.files[0])
        }}
        className={cn(
          // Children ignore the pointer, or crossing one would fire dragleave on the area
          'grid cursor-pointer justify-items-center gap-2 rounded-[18px] border-2 border-dashed px-5 py-7.5 text-center transition-colors *:pointer-events-none has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
          over
            ? 'border-primary bg-secondary'
            : error
              ? 'border-destructive/30 bg-destructive/5'
              : 'border-primary/30 bg-secondary/40',
        )}
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-card shadow-[0_4px_12px_rgb(79_104_241/0.15)]">
          <CloudUpload className="size-5.5 text-primary" />
        </span>
        <strong className="text-sm">Arrastra aquí el archivo</strong>
        <span className="text-[12.5px] text-muted-foreground">
          o{' '}
          <span className="font-semibold text-primary underline underline-offset-3">
            elígelo desde tu equipo
          </span>
        </span>
        <span className="text-[12.5px] text-muted-foreground">
          {ALLOWED_FILES} de hasta {formatSize(MAX_FILE_BYTES)}. Un archivo por
          caso.
        </span>
        <input
          id={INPUT_ID}
          type="file"
          accept={FILE_ACCEPT}
          aria-label="Elegir el archivo de evidencia"
          className="sr-only"
          {...ariaFor(INPUT_ID, error)}
          onChange={(event) => {
            onFile(event.target.files?.[0])
            // Emptied, so choosing the same file again still counts as a change
            event.target.value = ''
          }}
        />
      </label>
      <FieldError id={INPUT_ID} error={error} />
    </div>
  )
}
