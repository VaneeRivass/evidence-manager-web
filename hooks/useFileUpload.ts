import { useState } from 'react'
import { api, uploadToStorage } from '@/lib/api'
import { type Case, casePath } from '@/lib/cases'
import { useCaseMutation } from './useCases'

// expiresIn is left out: the link is used at once (RF-10)
type UploadLink = { uploadUrl: string; key: string }

// Three calls, one action: ask for a link, send the file to storage, confirm. `progress` goes
// 0 → 1 while the file travels; `finishing` is the API verifying it (RF-17).
export function useFileUpload(id: string) {
  const [progress, setProgress] = useState(0)

  const upload = useCaseMutation(async (file: File) => {
    const path = casePath(id)

    const link = await api.post<UploadLink>(`${path}/file/upload-url`, {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    })

    await uploadToStorage(link.uploadUrl, file, setProgress)

    return api.post<Case>(`${path}/file/complete`, { key: link.key })
  })

  return {
    ...upload,
    // Every attempt starts from an empty bar, set before the upload is pending: a retry
    // never shows the last attempt's full bar and «Terminando…», even for an instant
    attach: (file: File, onAttached: () => void) => {
      setProgress(0)
      upload.mutate(file, { onSuccess: onAttached })
    },
    progress,
    finishing: upload.isPending && progress === 1,
  }
}
