import {
  type MutationMeta,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api, isNetworkError } from '@/lib/api'
import {
  type Case,
  type CasesPage,
  type CaseStatus,
  casePath,
} from '@/lib/cases'
import type { CaseListFilters } from '@/lib/caseFilters'
import type { CaseInput } from '@/lib/schemas'

// The only place that knows the case routes. How a request is made lives in lib/api.ts.

// The filters are part of the key: each combination is cached on its own, and going back
// to one already seen shows it at once while it refreshes
export function useCases(filters: CaseListFilters) {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: () => api.get<CasesPage>('/cases', { params: filters }),
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

// The dialog's save: creates without a case, edits with one. The dialog shows its own errors
// (CaseFormDialog.tsx · RF-05, RF-08).
export const useSaveCase = (item?: Case) =>
  useCaseMutation(
    async (input: CaseInput) =>
      item
        ? api.patch<Case>(casePath(item.id), input)
        : api.post<Case>('/cases', input),
    { formHandlesErrors: true },
  )

// Closing and reopening, from the case page's button (RF-08)
export const useCaseStatus = (id: string) =>
  useCaseMutation(async (status: CaseStatus) =>
    api.patch<Case>(casePath(id), { status }),
  )

// A fresh link on every click. Signed as an attachment, so the browser saves the file and
// the page stays (RF-12).
export const useDownloadFile = (id: string) =>
  useMutation({
    mutationFn: () =>
      api.get<{ downloadUrl: string }>(`${casePath(id)}/file/download-url`),
    onSuccess: ({ downloadUrl }) => window.location.assign(downloadUrl),
  })

// The lists refresh. The case is marked stale, not removed: removed, its page — still open
// while it moves to the list — would ask for it again and flash a 404 (RF-09).
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
