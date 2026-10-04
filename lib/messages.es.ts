// Error code → the Spanish sentence a person reads. The API emits stable codes with
// parameters (RF-23); the text is decided here, and only here.

import type { Params } from './api'
import { ALLOWED_FILES, listFileTypes } from './files'
import { formatSize } from './format'

const caseGone = 'Este caso ya no existe. Puede que se haya eliminado.'
const couldNotVerify = 'No pudimos verificar el archivo. Inténtalo de nuevo.'

const messages: Record<string, (params: Params) => string> = {
  // Field codes, inside a VALIDATION_ERROR — or raised by lib/schemas.ts in the browser
  TOO_SHORT: ({ min }) =>
    min === 1 ? 'Este campo es obligatorio.' : `Mínimo ${min} caracteres.`,
  TOO_LONG: ({ max }) => `Máximo ${max} caracteres.`,
  INVALID_FORMAT: () => 'El formato no es válido.',
  INVALID_TYPE: () => 'El valor no es válido.',
  // A password of only whitespace has its own code, so the message can be true
  PASSWORD_BLANK: () => 'La contraseña no puede ser solo espacios.',

  VALIDATION_ERROR: () => 'Revisa los datos: hay alguno que no es válido.',
  UNAUTHENTICATED: () => 'Tu sesión ha caducado. Vuelve a entrar.',

  // One sentence for both: a stranger cannot tell a case exists (RF-07, RF-16)
  CASE_NOT_FOUND: () => caseGone,
  CASE_FORBIDDEN: () => caseGone,

  EMAIL_TAKEN: () => 'Ya existe una cuenta con este correo.',
  INVALID_CREDENTIALS: () => 'El correo o la contraseña no son correctos.',

  // With a name, the browser rejected it (mockup screen 12); without one, the API did, with
  // its own list (RF-10, RF-17)
  FILE_TYPE_NOT_ALLOWED: ({ name, allowed }) =>
    `${name ? `«${name}»` : 'Este tipo de archivo'} no se puede adjuntar: solo se admiten ${
      allowed
        ? listFileTypes(
            String(allowed)
              .split(',')
              .map((type) => type.trim()),
          )
        : ALLOWED_FILES
    }.`,
  FILE_TOO_LARGE: ({ name, size, max }) =>
    name
      ? `«${name}» pesa ${formatSize(Number(size))} y el máximo es ${formatSize(Number(max))}.`
      : `El archivo supera el máximo de ${formatSize(Number(max))}.`,
  FILE_ALREADY_ATTACHED: () =>
    'Este caso ya tiene un archivo, y la evidencia no se puede cambiar.',
  // Interrupted: the upload to storage itself, in lib/api.ts (RF-17)
  UPLOAD_FAILED: () =>
    'La subida se interrumpió. Revisa tu conexión e inténtalo de nuevo.',
  // Could not verify: one sentence, as the person's fix is the same (RF-17)
  FILE_NOT_UPLOADED: () => couldNotVerify,
  FILE_KEY_MISMATCH: () => couldNotVerify,
  FILE_REJECTED: () =>
    'No pudimos verificar el archivo. Elige otro e inténtalo de nuevo.',
  FILE_NOT_FOUND: () => 'Este caso ya no tiene ningún archivo.',

  NETWORK_ERROR: () =>
    'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  INTERNAL_ERROR: () => 'Algo falló en el servidor. Inténtalo de nuevo.',
}

// The label of the code shown under an operation error's message (mockup screen 24)
export const CODE_LABEL = 'Código de error'

// Success texts are composed here too, for the same reason as the errors: the text a person
// reads is decided in this file and nowhere else (RF-13, RF-16).
export const successMessages = {
  registered: 'Cuenta creada. Ya puedes entrar.',
  caseCreated: 'Caso creado',
  caseSaved: 'Cambios guardados',
  evidenceAttached: 'Evidencia adjuntada',
  caseDeleted: 'Caso eliminado',
}

// The five codes only a bug here can trigger (RF-19): retrying would fail the same way, so
// it asks for the code to be passed on
const fallback = () =>
  'Algo salió mal. Si vuelve a pasar, avisa con este código.'

export function message(code: string, params: Params = {}): string {
  return (messages[code] ?? fallback)(params)
}
