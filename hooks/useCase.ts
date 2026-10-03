import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { type Case, casePath } from '@/lib/cases'

// One case. Its own key, not under ['cases']: invalidating the lists does not throw away the
// case being looked at (RF-07).
export function useCase(id: string) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => api.get<Case>(casePath(id)),
  })
}
