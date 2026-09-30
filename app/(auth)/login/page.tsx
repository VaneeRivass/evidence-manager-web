import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'
import { AuthShell } from '@/components/auth/AuthShell'

export const metadata: Metadata = { title: 'Entrar · Gestor de evidencias' }

export default function LoginPage() {
  return (
    <AuthShell
      title="Cada caso, con su evidencia a mano."
      text="Registra incidencias, adjunta el archivo que las respalda y ciérralas cuando estén resueltas."
    >
      <AuthForm mode="login" />
    </AuthShell>
  )
}
