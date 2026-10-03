import { TriangleAlert, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { describeFile } from '@/lib/files'
import { EvidenceFileSummary } from './EvidenceFileSummary'

// Mockup screen 9 · chosen but not sent: the only moment to change one's mind
export function EvidenceChosenFile({
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
      <EvidenceFileSummary
        type={file.type}
        name={file.name}
        iconClass="h-14.5 w-11.5 rounded-md pb-2.25 text-[11px]"
      >
        {describeFile(file.type, file.size)}
      </EvidenceFileSummary>
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
