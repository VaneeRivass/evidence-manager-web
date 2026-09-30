import { useMutation } from '@tanstack/react-query'
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

// RF-13 · registering signs the person in: the API's 201 carries no session. Both calls
// use the values of this one submit; the password is not kept anywhere in between.
// Resolves to null when the account was created but the login failed.
export function useRegister() {
  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      await api.post('/auth/register', credentials)
      try {
        return (await api.post<User>('/auth/login', credentials)).data
      } catch {
        return null
      }
    },
  })
}
