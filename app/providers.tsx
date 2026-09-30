'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { ApiError } from '@/lib/api'

// A Client Component because both need the browser. The layout stays a Server Component
// and only wraps its children with this.
export function Providers({ children }: { children: React.ReactNode }) {
  // One client per browser tab, created once. At module level it would be shared by
  // every request Next renders on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
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
