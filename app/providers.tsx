'use client'

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { useState } from 'react'
import { Toaster, type ToasterProps } from 'sonner'
import { isNetworkError, isUnauthenticated } from '@/lib/api'
import { notifyError } from '@/lib/notify'
import { goToLogin } from '@/lib/session'

// Where a failed request ends up:
//   · 401, anywhere          → the login. The API already cleared the rejected cookie
//   · a failed action        → a notice, from the MutationCache below (RF-19)
//   · …from a form           → the form shows it itself: under a field, or a notice
//                              (meta.formHandlesErrors keeps this one from adding a second)
//   · a failed load          → no notice: the screen shows its own error state (RF-15)

// Lets a mutation carry `meta: { formHandlesErrors: true }`, typed
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { formHandlesErrors?: boolean }
  }
}

const leaveOn401 = (error: unknown) => {
  if (isUnauthenticated(error)) goToLogin()
}

// The notices as mockup screens 17 and 25 draw them. Unstyled: these classes are the whole
// look; sonner only places and animates them (RF-19).
const NOTICE_ICONS: ToasterProps['icons'] = {
  success: <CircleCheck className="size-5 text-accent-foreground" />,
  error: <CircleAlert className="size-5 text-destructive" />,
}

const NOTICE_OPTIONS: ToasterProps['toastOptions'] = {
  unstyled: true,
  closeButtonAriaLabel: 'Cerrar aviso',
  classNames: {
    toast:
      'flex w-full items-start gap-3 rounded-[16px] border bg-card py-3.5 pr-10 pl-4 text-foreground shadow-lg',
    icon: 'mt-px shrink-0',
    title: 'text-[13.5px] leading-snug font-bold',
    description: 'mt-1 text-xs text-muted-foreground',
    closeButton:
      'absolute top-3.5 right-2.5 grid size-6 place-items-center rounded-md text-muted-foreground hover:text-foreground',
  },
}

// A Client Component because both need the browser. The layout stays a Server Component
// and only wraps its children with this.
export function Providers({ children }: { children: React.ReactNode }) {
  // One client per browser tab, created once. At module level it would be shared by
  // every request Next renders on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: leaveOn401 }),
        mutationCache: new MutationCache({
          // Runs for every failed action, even if its screen is already gone
          onError: (error, _variables, _result, mutation) => {
            leaveOn401(error)
            if (!mutation.meta?.formHandlesErrors) notifyError(error)
          },
        }),
        defaultOptions: {
          // Offline, fail at once with NETWORK_ERROR. TanStack's default would pause the
          // request: an upload would sit at 0 % with nothing said (RF-19).
          mutations: { networkMode: 'always' },
          queries: {
            networkMode: 'always',
            // An answer from the API — 400, 401, 404 — is the same the second time, so it
            // is shown at once. Only a request that never got an answer is tried once more.
            retry: (failures, error) => failures < 1 && isNetworkError(error),
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        closeButton
        containerAriaLabel="Avisos"
        icons={NOTICE_ICONS}
        toastOptions={NOTICE_OPTIONS}
      />
    </QueryClientProvider>
  )
}
