import type { Metadata } from 'next'
import { NotFoundScreen } from '@/components/NotFoundScreen'
import PrivateLayout from './(app)/layout'

export const metadata: Metadata = {
  title: 'No encontrada · Gestor de evidencias',
}

// RF-14 · any address that matches no page. Next renders it outside (app)/layout, so it wraps
// itself in it to keep the top bar. Without a session proxy.ts sends to the login first.
export default function NotFound() {
  return (
    <PrivateLayout>
      <NotFoundScreen />
    </PrivateLayout>
  )
}
