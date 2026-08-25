import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

import {
  isStoryAvailableOffline,
  saveStoryForOffline,
} from '@/features/stories/storage/offline-stories'
import type { Story, StoryCard } from '@/features/stories/types'

export type OfflineStoryStatus = 'available' | 'idle' | 'saving'

export function useOfflineStory(story: Story | undefined, cards: StoryCard[] | undefined) {
  const [completedSlug, setCompletedSlug] = useState<string | null>(null)
  const [failedSlug, setFailedSlug] = useState<string | null>(null)
  const available = Boolean(
    story &&
      (completedSlug === story.slug || isStoryAvailableOffline(story.slug, story, cards)),
  )
  const shouldSave = Boolean(
    Platform.OS === 'web' &&
      story &&
      cards?.length &&
      !available &&
      failedSlug !== story.slug,
  )

  useEffect(() => {
    if (!shouldSave || !story || !cards?.length) {
      return
    }

    let cancelled = false

    void saveStoryForOffline(story, cards)
      .then((saved) => {
        if (!cancelled) {
          if (saved) {
            setCompletedSlug(story.slug)
          } else {
            setFailedSlug(story.slug)
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailedSlug(story.slug)
        }
      })

    return () => {
      cancelled = true
    }
  }, [cards, shouldSave, story])

  if (available) {
    return 'available'
  }

  return shouldSave ? 'saving' : 'idle'
}
