'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { Brand } from '@/components/Brand'
import { SkeletonBar } from '@/components/SkeletonBar'
import { Button } from '@/components/ui/button'
import { useLogout, useSession } from '@/hooks/useAuth'
import { notifyError } from '@/lib/notify'

// The bar over every private page: who is signed in, and the way out (RF-04). A 401 is
// not handled here: providers.tsx handles it for every request.
export function TopBar() {
  const session = useSession()
  const logout = useLogout()

  const email = session.data?.email

  return (
    <header className="flex items-center justify-between border-b bg-card px-5 py-3.5 sm:px-7">
      <Link href="/cases">
        <Brand />
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
          <SkeletonBar className="h-4 w-40" />
        )}
        <Button
          variant="ghost"
          onClick={() => logout.mutate(undefined, { onError: notifyError })}
          disabled={logout.isPending}
          className="text-muted-foreground"
        >
          <LogOut />
          Salir
        </Button>
      </div>
    </header>
  )
}
