import { LoaderCircle } from 'lucide-react'
import { formatSize } from '@/lib/format'
import { cn } from '@/lib/utils'
import { EvidenceFileSummary } from './EvidenceFileSummary'

// Mockup screens 10 and 11 · one bar for three calls. Once full it turns teal and reads
// «Terminando…» while the API verifies; otherwise it would look stuck at 100 %.
export function EvidenceUploading({
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
        <EvidenceFileSummary
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
        </EvidenceFileSummary>
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
