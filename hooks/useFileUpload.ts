import { useState } from 'react'
import { api, uploadToStorage } from '@/lib/api'
import { notifyError } from '@/lib/notify'
import { type Case, casePath, useCaseMutation } from './useCases'

// What the API answers for an upload link (RF-10). expiresIn is not used: the link is
// spent at once.
type UploadLink = { uploadUrl: string; key: string }

// RF-17 · three calls, one action. The person sees one bar: `progress` runs from 0 to 1
// while the file travels, and `finishing` is the last moment — the file is in storage and
// the API is verifying it (mockup screens 10 and 11). The case comes back with its file,
// so the page and every list refresh through useCaseMutation.
export function useFileUpload(id: string) {
  const [progress, setProgress] = useState(0)

  const upload = useCaseMutation(
    async (file: File) => {
      const path = casePath(id)

      const link = (
        await api.post<UploadLink>(`${path}/file/upload-url`, {
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        })
      ).data

      await uploadToStorage(link.uploadUrl, file, setProgress)

      return (await api.post<Case>(`${path}/file/complete`, { key: link.key }))
        .data
    },
    // Here, not in the panel: leaving the page mid-upload must not swallow the failure.
    // (#9 moves the notice to the one place all operation errors go.)
    { onError: notifyError },
  )

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
