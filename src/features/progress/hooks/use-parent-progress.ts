import { useQuery } from '@tanstack/react-query'

import { getParentProgress } from '@/features/progress/api/parent-progress'

export function useParentProgress(enabled = true) {
  return useQuery({
    queryKey: ['parent-progress'],
    queryFn: getParentProgress,
    enabled,
  })
}
