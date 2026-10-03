import type { Params } from './api'
import { formatSize } from './format'

// RF-17 · the evidence the API accepts, copied from its .env.example. The API still decides
// (RNF-04): if they ever differ, its own error arrives as a notice.

// MIME type → the name a person knows it by. The order is the order they read it in.
const FILE_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
}

export const MAX_FILE_BYTES = 5 * 1024 * 1024

// The accept attribute of the file picker: it narrows what the dialog offers, nothing more
export const FILE_ACCEPT = Object.keys(FILE_TYPES).join(',')

// «PDF» for application/pdf. MIME types ignore case, as the API does (RF-10).
export const fileLabel = (type: string | null): string | undefined =>
  FILE_TYPES[type?.toLowerCase() ?? '']

const either = new Intl.ListFormat('es', { type: 'disjunction' })

// «PDF, JPG o PNG». A type this table does not know reads as itself, so the API's own list —
// sent with FILE_TYPE_NOT_ALLOWED — is worded right even if it differs from ours.
export const listFileTypes = (types: string[]) =>
  either.format(types.map((type) => fileLabel(type) ?? type))

export const ALLOWED_FILES = listFileTypes(Object.keys(FILE_TYPES))

// Before any request: what is wrong with the file, in the API's own codes. A dropped file
// skips the picker's accept filter, so the type is checked here too.
export function checkFile(file: File): { code: string; params: Params } | null {
  if (!fileLabel(file.type)) {
    return { code: 'FILE_TYPE_NOT_ALLOWED', params: { name: file.name } }
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      code: 'FILE_TOO_LARGE',
      params: { name: file.name, size: file.size, max: MAX_FILE_BYTES },
    }
  }
  return null
}

// «PDF de 2,4 MB». A type our copied list does not know reads «Archivo de 2,4 MB».
export const describeFile = (type: string | null, size: number) =>
  `${fileLabel(type) ?? 'Archivo'} de ${formatSize(size)}`
