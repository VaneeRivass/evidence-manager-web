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
import {
  type ApiError,
  isNetworkError,
  isUnauthenticated,
  toApiError,
} from '@/lib/api'
import { notifyError } from '@/lib/notify'
import { goToLogin } from '@/lib/session'

// What a mutation can say about itself: which errors its form places on screen — under a
// field, or inside the form. Those get no notice; every other error does (RF-18, RF-19).
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { placedByForm?: (error: ApiError) => boolean }
  }
}

// RF-14 · a 401 on any query leaves for the login; on a mutation, the handler below does
const toLoginOn401 = (error: unknown) => {
  if (isUnauthenticated(error)) goToLogin()
}

// RF-19 · the notices, as mockup screens 17 and 25 draw them: a line icon, the message in
// bold, the code under it, the × on the right. Unstyled: sonner only places, stacks and
// animates them, so these classes are the whole look.
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
        queryCache: new QueryCache({ onError: toLoginOn401 }),
        mutationCache: new MutationCache({
          // RF-19 · every failed action's notice, from one place: a new action cannot
          // forget it, and it shows even if the screen that started it is gone
          // A 401 gets none: the page is already leaving for the login.
          onError: (error, _variables, _result, mutation) => {
            if (isUnauthenticated(error)) return goToLogin()
            const err = toApiError(error)
            if (!mutation.meta?.placedByForm?.(err)) notifyError(err)
          },
        }),
        defaultOptions: {
          // RF-19 · with the browser offline, a request is still sent, fails at once and
          // shows NETWORK_ERROR. TanStack's default pauses it until the connection returns:
          // an upload would sit at 0 % with nothing said.
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
