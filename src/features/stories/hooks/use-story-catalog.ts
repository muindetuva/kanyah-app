import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getCategories,
  getStories,
  getStory,
  getStoryCards,
  getStoryProgress,
  updateStoryProgress,
} from '@/features/stories/api/stories'
import type { StoryFilters } from '@/features/stories/types'

const catalogStaleTime = 5 * 60 * 1000

export function useCategories() {
  return useQuery({
    queryKey: ['story-categories'],
    queryFn: getCategories,
    staleTime: catalogStaleTime,
  })
}

export function useStories(filters: StoryFilters = {}) {
  return useQuery({
    queryKey: [
      'stories',
      filters.category ?? '',
      filters.search ?? '',
      filters.page ?? 1,
      filters.perPage ?? 20,
    ],
    queryFn: () => getStories(filters),
    staleTime: catalogStaleTime,
  })
}

export function useStory(slug: string | undefined) {
  return useQuery({
    queryKey: ['story', slug ?? ''],
    queryFn: () => getStory(slug!),
    enabled: Boolean(slug),
    staleTime: catalogStaleTime,
  })
}

export function useStoryCards(slug: string | undefined) {
  return useQuery({
    queryKey: ['story-cards', slug ?? ''],
    queryFn: () => getStoryCards(slug!),
    enabled: Boolean(slug),
    staleTime: catalogStaleTime,
  })
}

export function useStoryProgress(childProfileId: number | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: ['story-progress', childProfileId ?? 0, slug ?? ''],
    queryFn: () => getStoryProgress(childProfileId!, slug!),
    enabled: Boolean(childProfileId && slug),
  })
}

export function useUpdateStoryProgress(
  childProfileId: number | undefined,
  slug: string | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cardId: number) => updateStoryProgress(childProfileId!, slug!, cardId),
    onSuccess: (progress) => {
      queryClient.setQueryData(
        ['story-progress', childProfileId ?? 0, slug ?? ''],
        progress,
      )
    },
  })
}
