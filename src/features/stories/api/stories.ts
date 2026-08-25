import type { ApiResource } from '@/features/auth/types'
import type {
  Category,
  PaginatedStories,
  ReadingSession,
  Story,
  StoryCard,
  StoryCompletion,
  StoryFilters,
  StoryProgress,
} from '@/features/stories/types'
import {
  getOfflineCatalog,
  getOfflineCategories,
  getOfflineStory,
  getOfflineStoryCards,
  isBrowserOffline,
  saveOfflineCatalog,
  saveOfflineCategories,
} from '@/features/stories/storage/offline-stories'
import { apiGet, apiPost, apiPut } from '@/lib/api/client'

function storyQueryString(filters: StoryFilters): string {
  const params: string[] = []

  if (filters.age) {
    params.push(`age=${filters.age}`)
  }

  if (filters.category) {
    params.push(`category=${encodeURIComponent(filters.category)}`)
  }

  if (filters.search) {
    params.push(`search=${encodeURIComponent(filters.search)}`)
  }

  if (filters.page) {
    params.push(`page=${filters.page}`)
  }

  if (filters.perPage) {
    params.push(`per_page=${filters.perPage}`)
  }

  return params.length > 0 ? `?${params.join('&')}` : ''
}

export async function getCategories(): Promise<Category[]> {
  const offlineCategories = getOfflineCategories()

  if (isBrowserOffline() && offlineCategories) {
    return offlineCategories
  }

  try {
    const response = await apiGet<ApiResource<Category[]>>('/api/v1/categories')
    saveOfflineCategories(response.data)
    return response.data
  } catch (error) {
    if (offlineCategories) {
      return offlineCategories
    }

    throw error
  }
}

export async function getStories(filters: StoryFilters = {}): Promise<PaginatedStories> {
  const offlineCatalog = getOfflineCatalog(filters)

  if (isBrowserOffline() && offlineCatalog) {
    return offlineCatalog
  }

  try {
    const stories = await apiGet<PaginatedStories>(
      `/api/v1/stories${storyQueryString(filters)}`,
    )
    saveOfflineCatalog(filters, stories)
    return stories
  } catch (error) {
    if (offlineCatalog) {
      return offlineCatalog
    }

    throw error
  }
}

export async function getStory(slug: string): Promise<Story> {
  const offlineStory = getOfflineStory(slug)

  if (isBrowserOffline() && offlineStory) {
    return offlineStory
  }

  try {
    const response = await apiGet<ApiResource<Story>>(
      `/api/v1/stories/${encodeURIComponent(slug)}`,
    )
    return response.data
  } catch (error) {
    if (offlineStory) {
      return offlineStory
    }

    throw error
  }
}

export async function getStoryCards(slug: string): Promise<StoryCard[]> {
  const offlineCards = getOfflineStoryCards(slug)

  if (isBrowserOffline() && offlineCards) {
    return offlineCards
  }

  try {
    const response = await apiGet<ApiResource<StoryCard[]>>(
      `/api/v1/stories/${encodeURIComponent(slug)}/cards`,
    )
    return response.data
  } catch (error) {
    if (offlineCards) {
      return offlineCards
    }

    throw error
  }
}

export async function getStoryProgress(
  childProfileId: number,
  slug: string,
): Promise<StoryProgress | null> {
  if (isBrowserOffline()) {
    return null
  }

  const response = await apiGet<ApiResource<StoryProgress | null>>(
    `/api/v1/child-profiles/${childProfileId}/stories/${encodeURIComponent(slug)}/progress`,
    true,
  )
  return response.data
}

export async function updateStoryProgress(
  childProfileId: number,
  slug: string,
  cardId: number,
): Promise<StoryProgress> {
  const response = await apiPut<ApiResource<StoryProgress>>(
    `/api/v1/child-profiles/${childProfileId}/stories/${encodeURIComponent(slug)}/progress`,
    { card_id: cardId },
    true,
  )
  return response.data
}

export async function completeStory(
  childProfileId: number,
  slug: string,
): Promise<StoryCompletion> {
  const response = await apiPost<ApiResource<StoryCompletion>>(
    `/api/v1/child-profiles/${childProfileId}/stories/${encodeURIComponent(slug)}/complete`,
    undefined,
    true,
  )

  return response.data
}

export async function startReadingSession(
  childProfileId: number,
  slug: string,
): Promise<ReadingSession> {
  const response = await apiPost<ApiResource<ReadingSession>>(
    `/api/v1/child-profiles/${childProfileId}/stories/${encodeURIComponent(slug)}/reading-sessions`,
    undefined,
    true,
  )
  return response.data
}

export async function updateReadingSession(
  sessionId: number,
  activeSeconds: number,
  ended = false,
): Promise<ReadingSession> {
  const response = await apiPut<ApiResource<ReadingSession>>(
    `/api/v1/reading-sessions/${sessionId}`,
    { active_seconds: activeSeconds, ended },
    true,
  )
  return response.data
}
