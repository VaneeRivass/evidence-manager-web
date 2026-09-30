import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Credentials } from '@/lib/schemas'
import { goToLogin } from '@/lib/session'

// The only place that knows the auth routes. How a request is made lives in lib/api.ts.

type User = { id: string; email: string }

// The login already answers who signed in: it seeds the session query, so the top bar
// does not ask /auth/me again right after
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: Credentials) =>
      (await api.post<User>('/auth/login', credentials)).data,
    onSuccess: (user) => queryClient.setQueryData(['session'], user),
  })
}

// RF-13 · registering does not sign the person in: they sign in themselves
export function useRegister() {
  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      await api.post('/auth/register', credentials)
    },
  })
}

// RF-03 · who is signed in. The cookie cannot be read from here (httpOnly), so the API
// says. It does not change during a session, so it is asked once; a session that expires
// is caught by whichever request next answers 401 (providers.tsx).
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => (await api.get<User>('/auth/me')).data,
    staleTime: Infinity,
  })
}

// RF-04 · the API clears the cookie, then the session is left (lib/session.ts). A 401 here —
// the session had already expired — ends in the same place (providers.tsx).
export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: goToLogin,
  })
}
