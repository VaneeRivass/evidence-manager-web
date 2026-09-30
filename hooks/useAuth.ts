import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Credentials } from '@/lib/schemas'

// The only place that knows the auth routes. How a request is made lives in lib/api.ts.

type User = { id: string; email: string }

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: Credentials) =>
      (await api.post<User>('/auth/login', credentials)).data,
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
// says. No retries: a 401 is an answer, not a hiccup, and the person must leave at once.
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => (await api.get<User>('/auth/me')).data,
    retry: false,
    staleTime: Infinity,
  })
}

// RF-04 · the API clears the cookie; the cache is emptied so the next person on this
// browser never sees the previous one's data
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => queryClient.clear(),
  })
}
