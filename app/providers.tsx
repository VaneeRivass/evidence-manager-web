'use client'

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { ApiError, isUnauthenticated } from '@/lib/api'
import { goToLogin } from '@/lib/session'

// RF-14 · the one place a 401 is handled, for every query and every mutation
const toLoginOn401 = (error: unknown) => {
  if (isUnauthenticated(error)) goToLogin()
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
        mutationCache: new MutationCache({ onError: toLoginOn401 }),
        defaultOptions: {
          // RF-19 · with the browser offline, a request is still sent, fails at once and
          // shows NETWORK_ERROR. TanStack's default pauses it until the connection returns:
          // an upload would sit at 0 % with nothing said.
          mutations: { networkMode: 'always' },
          queries: {
            networkMode: 'always',
            // An answer from the API — 400, 401, 404 — is the same the second time, so it
            // is shown at once. Only a request that never got an answer is tried once more.
            retry: (failures, error) =>
              failures < 1 &&
              error instanceof ApiError &&
              error.code === 'NETWORK_ERROR',
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* RF-19 · operation errors float here */}
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  )
}
