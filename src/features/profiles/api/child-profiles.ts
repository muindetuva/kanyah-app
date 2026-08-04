import type {
  ApiResource,
  ChildProfile,
  CreateChildProfileInput,
} from '@/features/auth/types'
import { apiPost } from '@/lib/api/client'

export async function createChildProfile(
  input: CreateChildProfileInput,
): Promise<ChildProfile> {
  const response = await apiPost<ApiResource<ChildProfile>>(
    '/api/v1/child-profiles',
    input,
    true,
  )

  return response.data
}
