'use client'

import { Check, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDownloadFile } from '@/hooks/useCases'
import type { Case } from '@/lib/cases'
import { describeFile } from '@/lib/files'
import { EvidenceFileSummary } from './EvidenceFileSummary'

// The API verified the file before storing it, so it says so (RF-11 · mockup screen 13)
export function EvidenceAttached({ item }: { item: Case }) {
  const download = useDownloadFile(item.id)

  return (
    // The card measures itself, not the screen: in the case page's narrow column the button
    // goes under the name, so the name keeps the width
    <div className="@container grid gap-2.5">
      <div className="grid gap-3 rounded-2xl border p-3.5 @md:flex @md:items-center">
        <EvidenceFileSummary
          type={item.fileType}
          name={item.fileName ?? ''}
          iconClass="h-12.5 w-10 rounded-md pb-2 text-[10.5px]"
        >
          {describeFile(item.fileType, item.fileSize ?? 0)}
          <span className="mt-0.5 flex items-center gap-1 font-semibold text-accent-foreground">
            <Check className="size-3.25" />
            Verificada
          </span>
        </EvidenceFileSummary>
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
