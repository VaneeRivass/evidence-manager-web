// Error code → the Spanish sentence a person reads. The API emits stable codes with
// parameters (RF-23); the text is decided here, and only here.

import type { Params } from './api'

const messages: Record<string, (params: Params) => string> = {
  // Field codes, inside a VALIDATION_ERROR — or raised by lib/schemas.ts in the browser
  TOO_SHORT: ({ min }) =>
    min === 1 ? 'Este campo es obligatorio.' : `Mínimo ${min} caracteres.`,
  TOO_LONG: ({ max }) => `Máximo ${max} caracteres.`,
  INVALID_FORMAT: () => 'El formato no es válido.',
  INVALID_TYPE: () => 'El valor no es válido.',

  VALIDATION_ERROR: () => 'Revisa los datos: hay alguno que no es válido.',
  UNAUTHENTICATED: () => 'Tu sesión ha caducado. Vuelve a entrar.',

  EMAIL_TAKEN: () => 'Ya existe una cuenta con este correo.',
  INVALID_CREDENTIALS: () => 'El correo o la contraseña no son correctos.',

  NETWORK_ERROR: () =>
    'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  INTERNAL_ERROR: () => 'Algo falló en el servidor. Inténtalo de nuevo.',
}

// A code with no sentence yet still shows something honest — without blaming the server
// for what may have been the request
const fallback = () => 'Algo salió mal. Inténtalo de nuevo.'

export function message(code: string, params: Params = {}): string {
  return (messages[code] ?? fallback)(params)
}
