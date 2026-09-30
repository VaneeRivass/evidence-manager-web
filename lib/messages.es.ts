// Error code → the Spanish sentence a person reads. The API emits stable codes with
// parameters (RF-23); the text is decided here, and only here.

type Params = Record<string, string | number>

const messages: Record<string, (params: Params) => string> = {
  // Field codes, inside a VALIDATION_ERROR — or raised by lib/schemas.ts in the browser
  TOO_SHORT: ({ min }) =>
    min === 1 ? 'Este campo es obligatorio.' : `Mínimo ${min} caracteres.`,
  TOO_LONG: ({ max }) => `Máximo ${max} caracteres.`,
  INVALID_FORMAT: () => 'El formato no es válido.',

  EMAIL_TAKEN: () => 'Ya existe una cuenta con este correo.',
  INVALID_CREDENTIALS: () => 'El correo o la contraseña no son correctos.',

  NETWORK_ERROR: () =>
    'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  INTERNAL_ERROR: () => 'Algo falló en el servidor. Inténtalo de nuevo.',
}

// A code with no sentence yet still shows something honest, never a blank notice
export function message(code: string, params: Params = {}): string {
  return (messages[code] ?? messages.INTERNAL_ERROR)(params)
}
