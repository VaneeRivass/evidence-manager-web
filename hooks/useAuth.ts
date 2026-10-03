import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Credentials } from '@/lib/schemas'
import { goToLogin } from '@/lib/session'

// The only place that knows the auth routes. How a request is made lives in lib/api.ts.

type User = { id: string; email: string }

// The login's answer is who signed in: it seeds the session, so /auth/me is not asked again
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { formHandlesErrors: true }, // AuthForm.tsx shows its errors
    mutationFn: async (credentials: Credentials) =>
      (await api.post<User>('/auth/login', credentials)).data,
    onSuccess: (user) => queryClient.setQueryData(['session'], user),
  })
}

// RF-13 · registering does not sign the person in: they sign in themselves
export function useRegister() {
  return useMutation({
    meta: { formHandlesErrors: true }, // AuthForm.tsx shows its errors
    mutationFn: async (credentials: Credentials) => {
      await api.post('/auth/register', credentials)
    },
  })
}

// RF-03 · who is signed in: the cookie is httpOnly, so the API says. Asked once — it does
// not change during a session.
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => (await api.get<User>('/auth/me')).data,
    staleTime: Infinity,
  })
}

const logout = () => api.post('/auth/logout')

// RF-04 · the sign-out button. If it fails the person stays, and the notice says why.
export function useLogout() {
  return useMutation({ mutationFn: logout, onSuccess: goToLogin })
}
