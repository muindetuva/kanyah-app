import { useQuery } from '@tanstack/react-query'

import { getChildProfileBadges } from '@/features/profiles/api/child-profiles'

export function useProfileBadges(profileId: number | undefined) {
  return useQuery({
    queryKey: ['profile-badges', profileId ?? 0],
    queryFn: () => getChildProfileBadges(profileId!),
    enabled: Boolean(profileId),
  })
}
