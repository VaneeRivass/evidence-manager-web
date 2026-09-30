import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CaseFilters, CaseStatus } from '@/lib/caseFilters'

// The only place that knows the case routes. How a request is made lives in lib/api.ts.

// What the API sends for a case (evidence-manager-api, cases.mapper.ts)
export type Case = {
  id: string
  title: string
  description: string
  status: CaseStatus
  fileName: string | null
  fileSize: number | null
  fileType: string | null
  createdAt: string
  updatedAt: string
}

// RF-06 · at most 100 items; total counts every case matching the filter
export type CaseList = { items: Case[]; total: number }

// The filters are part of the key: each combination is cached on its own, and going back
// to one already seen shows it at once while it refreshes
export function useCases(filters: CaseFilters) {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: async () =>
      (await api.get<CaseList>('/cases', { params: filters })).data,
  })
}
