import type { ApiResource } from '@/features/auth/types'
import type { ChildProgressSummary } from '@/features/progress/types'
import { apiGet } from '@/lib/api/client'

export async function getParentProgress(): Promise<ChildProgressSummary[]> {
  const response = await apiGet<ApiResource<ChildProgressSummary[]>>(
    '/api/v1/parent/progress',
    true,
  )

  return response.data
}
