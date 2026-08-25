import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  completeStory,
  getCategories,
  getStories,
  getStory,
  getStoryCards,
  getStoryProgress,
  updateStoryProgress,
} from '@/features/stories/api/stories'
import { queueStoryCompletion } from '@/features/stories/storage/offline-progress'
import { isBrowserOffline } from '@/features/stories/storage/offline-stories'
import type {
  Story,
  StoryCard,
  StoryCompletion,
  StoryFilters,
  StoryProgress,
} from '@/features/stories/types'
import { ApiError } from '@/lib/api/client'

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
      filters.age ?? 0,
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
      void queryClient.invalidateQueries({ queryKey: ['parent-progress'] })
    },
  })
}

export function useCompleteStory(
  childProfileId: number | undefined,
  slug: string | undefined,
) {
  const queryClient = useQueryClient()

  function offlineCompletion(): StoryCompletion {
    const now = new Date().toISOString()
    const story = queryClient.getQueryData<Story>(['story', slug ?? ''])
    const cards = queryClient.getQueryData<StoryCard[]>(['story-cards', slug ?? ''])
    const currentProgress = queryClient.getQueryData<StoryProgress | null>([
      'story-progress',
      childProfileId ?? 0,
      slug ?? '',
    ])
    const lastCard = cards?.[cards.length - 1]
    const lastPosition = lastCard?.position ?? currentProgress?.furthestCardPosition ?? 1

    return {
      newBadges: [],
      pendingSync: true,
      progress: {
        childProfileId: childProfileId!,
        completedAt: now,
        currentCardId: lastCard?.id ?? currentProgress?.currentCardId ?? 0,
        currentCardPosition: lastPosition,
        furthestCardPosition: Math.max(
          lastPosition,
          currentProgress?.furthestCardPosition ?? 0,
        ),
        id: currentProgress?.id ?? 0,
        lastReadAt: now,
        startedAt: currentProgress?.startedAt ?? now,
        status: 'completed',
        story,
        storyId: story?.id ?? currentProgress?.storyId ?? 0,
      },
    }
  }

  return useMutation({
    mutationFn: async () => {
      if (isBrowserOffline()) {
        queueStoryCompletion(childProfileId!, slug!)
        return offlineCompletion()
      }

      try {
        return await completeStory(childProfileId!, slug!)
      } catch (error) {
        if (!(error instanceof ApiError)) {
          queueStoryCompletion(childProfileId!, slug!)
          return offlineCompletion()
        }

        throw error
      }
    },
    onSuccess: (completion) => {
      queryClient.setQueryData(
        ['story-progress', childProfileId ?? 0, slug ?? ''],
        completion.progress,
      )
      void queryClient.invalidateQueries({
        queryKey: ['profile-badges', childProfileId ?? 0],
      })
      void queryClient.invalidateQueries({ queryKey: ['parent-progress'] })
    },
  })
}
