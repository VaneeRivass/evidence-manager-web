'use client'

import { FileCheck2, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useLogout, useSession } from '@/hooks/useAuth'
import { ApiError } from '@/lib/api'
import { notifyError } from '@/lib/notify'

const isUnauthenticated = (error: unknown) =>
  error instanceof ApiError && error.code === 'UNAUTHENTICATED'

// The bar over every private page: who is signed in, and the way out (RF-04)
export function TopBar() {
  const router = useRouter()
  const session = useSession()
  const logout = useLogout()

  // RF-14 · a cookie the API no longer accepts. The guard let it through because it only
  // sees that the cookie exists; the login screen's guard will delete it.
  useEffect(() => {
    if (isUnauthenticated(session.error)) router.replace('/login')
  }, [session.error, router])

  const signOut = () =>
    logout.mutate(undefined, {
      onSuccess: () => router.replace('/login'),
      onError: (error) =>
        // Rejected already: there is no session to close, so leave as if it worked
        isUnauthenticated(error)
          ? router.replace('/login')
          : notifyError(error),
    })

  const email = session.data?.email

  return (
    <header className="flex items-center justify-between border-b bg-card px-5 py-3.5 sm:px-7">
      <Link
        href="/cases"
        className="flex items-center gap-2.5 font-bold tracking-tight"
      >
        <span className="grid size-8 place-items-center rounded-[10px] bg-primary">
          <FileCheck2 className="size-4 text-white" />
        </span>
        Gestor de evidencias
      </Link>

      <div className="flex items-center gap-3.5 text-[13px] text-muted-foreground">
        {email ? (
          <>
            <span className="hidden sm:inline">{email}</span>
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
            >
              {email.slice(0, 2).toUpperCase()}
            </span>
          </>
        ) : (
          // The same space the email will take, so the bar does not jump
          <span className="h-4 w-40 animate-pulse rounded-full bg-muted" />
        )}
        <Button
          variant="ghost"
          onClick={signOut}
          disabled={logout.isPending}
          className="rounded-full text-[13px] text-muted-foreground"
        >
          <LogOut />
          Salir
        </Button>
      </div>
    </header>
  )
}
