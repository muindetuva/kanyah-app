import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Platform } from 'react-native'

import { completeStory } from '@/features/stories/api/stories'
import {
  getPendingStoryCompletions,
  removePendingStoryCompletion,
} from '@/features/stories/storage/offline-progress'

export function useOfflineProgressSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return
    }

    let syncing = false

    async function syncCompletions() {
      if (syncing || !window.navigator.onLine) {
        return
      }

      syncing = true

      try {
        for (const pending of getPendingStoryCompletions()) {
          try {
            const completion = await completeStory(pending.childProfileId, pending.slug)
            removePendingStoryCompletion(pending.childProfileId, pending.slug)
            queryClient.setQueryData(
              ['story-progress', pending.childProfileId, pending.slug],
              completion.progress,
            )
            void queryClient.invalidateQueries({
              queryKey: ['profile-badges', pending.childProfileId],
            })
            void queryClient.invalidateQueries({ queryKey: ['parent-progress'] })
          } catch {
            break
          }
        }
      } finally {
        syncing = false
      }
    }

    void syncCompletions()
    window.addEventListener('online', syncCompletions)

    return () => {
      window.removeEventListener('online', syncCompletions)
    }
  }, [queryClient])
}
