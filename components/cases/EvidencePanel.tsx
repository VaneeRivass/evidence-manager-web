'use client'

import {
  Check,
  CloudUpload,
  Download,
  LoaderCircle,
  TriangleAlert,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { ariaFor, FieldError } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { type Case, useDownloadFile } from '@/hooks/useCases'
import { useFileUpload } from '@/hooks/useFileUpload'
import {
  ALLOWED_FILES,
  checkFile,
  FILE_ACCEPT,
  fileLabel,
  MAX_FILE_BYTES,
} from '@/lib/files'
import { formatSize } from '@/lib/format'
import { message } from '@/lib/messages.es'
import { cn } from '@/lib/utils'
import { FileIcon } from './CaseBadges'

// RF-17 · RF-12 · the case's evidence, mockup screens 8 to 13. One file per case, never
// replaced: with a file, it can only be downloaded; without one, a chosen file waits for
// Attach — nothing is sent before.
export function EvidencePanel({ item }: { item: Case }) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>()
  const upload = useFileUpload(item.id)

  // Checked before anything is sent: a wrong file never reaches the API (mockup screen 12)
  const choose = (picked: File | undefined) => {
    if (!picked) return
    const problem = checkFile(picked)
    setError(problem ? message(problem.code, problem.params) : undefined)
    setFile(problem ? null : picked)
  }

  if (item.fileName) return <AttachedFile item={item} />

  if (file && upload.isPending) {
    return (
      <UploadingFile
        file={file}
        progress={upload.progress}
        finishing={upload.finishing}
      />
    )
  }

  if (file) {
    return (
      <ChosenFile
        file={file}
        onChooseAnother={() => setFile(null)}
        // A failed upload keeps the file on screen: pressing Attach again is the retry
        onAttach={() => upload.attach(file, () => setFile(null))}
      />
    )
  }

  return <DropArea onFile={choose} error={error} />
}

const INPUT_ID = 'evidence-file'

// Screens 8 and 12. A label around a real file input: a click or Enter opens the picker,
// and a dropped file arrives through the same `onFile`.
function DropArea({
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

// Screen 9 · the only moment to change one's mind
function ChosenFile({
  file,
  onChooseAnother,
  onAttach,
}: {
  file: File
  onChooseAnother: () => void
  onAttach: () => void
}) {
  return (
    <div className="grid gap-3.5 rounded-[18px] border border-primary/30 bg-secondary/40 p-4.5">
      <FileSummary
        type={file.type}
        name={file.name}
        iconClass="h-14.5 w-11.5 rounded-md pb-2.25 text-[11px]"
      >
        {describe(file.type, file.size)}
      </FileSummary>
      <p className="flex items-center gap-2 text-[12.5px] text-slate">
        <TriangleAlert className="size-3.75 shrink-0 text-amber" />
        Una vez adjuntado no se podrá cambiar por otro archivo.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onChooseAnother}>
          Elegir otro
        </Button>
        <Button onClick={onAttach}>
          <Upload />
          Adjuntar
        </Button>
      </div>
    </div>
  )
}

// Screens 10 and 11 · one bar for three calls. Full, it turns teal and reads «Terminando…»
// while the API verifies — without it the bar would look stuck at 100 %.
function UploadingFile({
  file,
  progress,
  finishing,
}: {
  file: File
  progress: number
  finishing: boolean
}) {
  const percent = Math.round(progress * 100)

  return (
    <div className="grid gap-2.5">
      <div className="grid gap-2.5 rounded-2xl border p-3.5">
        <FileSummary
          type={file.type}
          name={file.name}
          aside={
            <span className="text-xs text-muted-foreground tabular-nums">
              {percent} %
            </span>
          }
        >
          {finishing ? (
            <span className="inline-flex items-center gap-1.5">
              <LoaderCircle className="size-3.5 text-teal motion-safe:animate-spin" />
              Terminando…
            </span>
          ) : (
            `Subiendo ${formatSize(Math.round(progress * file.size))} de ${formatSize(file.size)}`
          )}
        </FileSummary>
        <div
          role="progressbar"
          aria-label="Subiendo el archivo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width]',
              finishing
                ? 'bg-teal'
                : 'bg-linear-to-r from-primary to-[#7d8ff6]',
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        No cierres esta pestaña hasta que termine.
      </p>
    </div>
  )
}

// Screen 13 · verified by the API before it was stored (RF-11), so it says so
function AttachedFile({ item }: { item: Case }) {
  const download = useDownloadFile(item.id)

  return (
    <div className="grid gap-2.5">
      <div className="grid gap-3 rounded-2xl border p-3.5 sm:flex sm:items-center">
        <FileSummary
          type={item.fileType}
          name={item.fileName ?? ''}
          iconClass="h-12.5 w-10 rounded-md pb-2 text-[10.5px]"
        >
          {describe(item.fileType, item.fileSize ?? 0)}
          <span className="mt-0.5 flex items-center gap-1 font-semibold text-accent-foreground">
            <Check className="size-3.25" />
            Verificada
          </span>
        </FileSummary>
        <Button onClick={() => download.mutate()} disabled={download.isPending}>
          <Download />
          Descargar
        </Button>
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        Cada caso guarda un único archivo y no se puede reemplazar.
      </p>
    </div>
  )
}

// «PDF de 2,4 MB». A type this table does not know — the API's list is configurable, ours
// is copied — still reads well: «Archivo de 2,4 MB».
const describe = (type: string | null, size: number) =>
  `${fileLabel(type) ?? 'Archivo'} de ${formatSize(size)}`

// The file's icon, its name and a line under it — the same row in every state
function FileSummary({
  type,
  name,
  iconClass,
  aside,
  children,
}: {
  type: string | null
  name: string
  iconClass?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <FileIcon type={type} className={iconClass} />
      <div className="grid min-w-0 flex-1">
        <span title={name} className="truncate text-[13.5px] font-semibold">
          {name}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {children}
        </span>
      </div>
      {aside}
    </div>
  )
}
