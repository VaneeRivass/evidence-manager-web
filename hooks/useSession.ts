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
    mutationFn: (credentials: Credentials) =>
      api.post<User>('/auth/login', credentials),
    onSuccess: (user) => queryClient.setQueryData(['session'], user),
  })
}

// Registering does not sign the person in: they sign in themselves (RF-13)
export function useRegister() {
  return useMutation({
    meta: { formHandlesErrors: true }, // AuthForm.tsx shows its errors
    mutationFn: (credentials: Credentials) =>
      api.post('/auth/register', credentials),
  })
}

// Who is signed in: the cookie is httpOnly, so the API says. Asked once — it does not change
// during a session (RF-03).
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => api.get<User>('/auth/me'),
    staleTime: Infinity,
  })
}

// The sign-out button. If it fails the person stays, and the notice says why (RF-04).
export function useLogout() {
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => goToLogin(),
  })
}
