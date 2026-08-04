import { useQuery } from '@tanstack/react-query'

import {
  getCategories,
  getStories,
  getStory,
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
