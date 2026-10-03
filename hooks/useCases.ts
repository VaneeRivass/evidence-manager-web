import {
  type MutationMeta,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api, isNetworkError } from '@/lib/api'
import type { CaseFilters, CaseStatus } from '@/lib/caseFilters'
import type { CaseInput } from '@/lib/schemas'

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
type CasesPage = { items: Case[]; total: number }

// The filters are part of the key: each combination is cached on its own, and going back
// to one already seen shows it at once while it refreshes
export function useCases(filters: CaseFilters) {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: async () =>
      (await api.get<CasesPage>('/cases', { params: filters })).data,
  })
}

// The id comes from the address, which anyone can type: encoded, `/cases/..%2Fauth%2Fme`
// stays one path segment the API rejects as malformed, instead of becoming another route
export const casePath = (id: string) => `/cases/${encodeURIComponent(id)}`

// RF-07 · one case. Its own key, not under ['cases']: invalidating the lists does not throw
// away the case being looked at
export function useCase(id: string) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: async () => (await api.get<Case>(casePath(id))).data,
  })
}

// Every change to a case goes through here.
// · Success: the case takes the API's answer, and every list (any filter: ['cases'] is the
//   prefix of all their keys) is asked again.
// · Failure: the case may have changed elsewhere — deleted in another window — so it is asked
//   again (RF-16). Not after NETWORK_ERROR: nothing reached the server.
// The notice is not here: providers.tsx shows it for every failed action.
export function useCaseMutation<Variables>(
  mutationFn: (variables: Variables) => Promise<Case>,
  meta?: MutationMeta,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    meta,
    onSuccess: (item) => {
      queryClient.setQueryData(['case', item.id], item)
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
    onError: (error) => {
      if (!isNetworkError(error)) {
        queryClient.invalidateQueries({ queryKey: ['case'] })
      }
    },
  })
}

// RF-05 · RF-08 · the dialog's save: creates without a case, edits with one. The dialog
// shows its own errors (CaseFormDialog.tsx).
export const useSaveCase = (item?: Case) =>
  useCaseMutation(
    async (input: CaseInput) => {
      const request = item
        ? api.patch<Case>(casePath(item.id), input)
        : api.post<Case>('/cases', input)
      return (await request).data
    },
    { formHandlesErrors: true },
  )

// RF-08 · closing and reopening, from the case page's button
export const useCaseStatus = (id: string) =>
  useCaseMutation(
    async (status: CaseStatus) =>
      (await api.patch<Case>(casePath(id), { status })).data,
  )

// RF-12 · a fresh link on every click. Signed as an attachment, so the browser saves the
// file and the page stays.
export const useDownloadFile = (id: string) =>
  useMutation({
    mutationFn: async () =>
      (
        await api.get<{ downloadUrl: string }>(
          `${casePath(id)}/file/download-url`,
        )
      ).data,
    onSuccess: ({ downloadUrl }) => window.location.assign(downloadUrl),
  })

// RF-09 · the lists refresh. The case is marked stale, not removed: removed, its page — still
// open while it moves to the list — would ask for it again and flash a 404.
export function useDeleteCase(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.delete(casePath(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['case', id],
        refetchType: 'none',
      })
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
    // As for every failed change (useCaseMutation): deleted elsewhere, the page shows so
    onError: (error) => {
      if (!isNetworkError(error)) {
        queryClient.invalidateQueries({ queryKey: ['case', id] })
      }
    },
  })
}
