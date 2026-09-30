import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'
import { AuthShell } from '@/components/auth/AuthShell'

export const metadata: Metadata = {
  title: 'Crear cuenta · Gestor de evidencias',
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crea tu cuenta en un minuto."
      text="Solo necesitas un correo y una contraseña. Tus casos solo los ves tú."
    >
      <AuthForm mode="register" />
    </AuthShell>
  )
}
