import type { Metadata } from 'next'
import { NotFoundScreen } from '@/components/NotFoundScreen'

export const metadata: Metadata = {
  title: 'No encontrada · Gestor de evidencias',
}

// RF-14 · every address that matches no page lands here, inside the private layout, so
// the top bar stays. /login, /register and /cases are more specific and always win.
//
// It renders the screen itself rather than calling notFound(): Next renders not-found.tsx
// outside the (app) layout, which drops the top bar. The cost is a 200 instead of a 404,
// which matters to search engines — and this application has no public pages.
export default function UnknownAddress() {
  return <NotFoundScreen />
}
