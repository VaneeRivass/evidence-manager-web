import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'
import { AuthShell } from '@/components/auth/AuthShell'

export const metadata: Metadata = { title: 'Entrar · Gestor de evidencias' }

// RF-14 · a rejected session the API leaves in place lands here with the «expirada» marker:
// say why, so the person knows their session ended and not that the application broke
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expirada?: string }>
}) {
  const { expirada } = await searchParams

  return (
    <AuthShell
      title="Cada caso, con su evidencia a mano."
      text="Registra incidencias, adjunta el archivo que las respalda y ciérralas cuando estén resueltas."
    >
      <AuthForm mode="login" expired={expirada !== undefined} />
    </AuthShell>
  )
}
