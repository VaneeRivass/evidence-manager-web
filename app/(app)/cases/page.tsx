import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mis casos · Gestor de evidencias' }

// The list and its three states arrive with #6 (RF-15)
export default function CasesPage() {
  return <h1 className="text-2xl font-extrabold tracking-tight">Mis casos</h1>
}
