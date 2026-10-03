'use client'

import { useState } from 'react'
import type { Case } from '@/lib/cases'
import { useFileUpload } from '@/hooks/useFileUpload'
import { checkFile } from '@/lib/files'
import { message } from '@/lib/messages.es'
import { EvidenceAttached } from './EvidenceAttached'
import { EvidenceChosenFile } from './EvidenceChosenFile'
import { EvidenceDropArea } from './EvidenceDropArea'
import { EvidenceUploading } from './EvidenceUploading'

// The case's evidence. It picks one of four states and nothing else; each state is drawn in
// its own file (RF-12, RF-17 · mockup screens 8 to 13).
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

  // 1 · The case already has its file: it can only be downloaded
  if (item.fileName) return <EvidenceAttached item={item} />

  // 2 · Uploading: one progress bar
  if (file && upload.isPending) {
    return (
      <EvidenceUploading
        file={file}
        progress={upload.progress}
        finishing={upload.finishing}
      />
    )
  }

  // 3 · Chosen, waiting for Attach. After a failed upload the file stays here, so pressing
  // Attach again is the retry.
  if (file) {
    return (
      <EvidenceChosenFile
        file={file}
        onChooseAnother={() => setFile(null)}
        onAttach={() => upload.attach(file, () => setFile(null))}
      />
    )
  }

  // 4 · Nothing chosen yet
  return <EvidenceDropArea onFile={choose} error={error} />
}
