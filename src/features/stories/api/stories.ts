import type { ApiResource } from '@/features/auth/types'
import type {
  Category,
  PaginatedStories,
  ReadingSession,
  Story,
  StoryCard,
  StoryFilters,
  StoryProgress,
} from '@/features/stories/types'
import { apiGet, apiPost, apiPut } from '@/lib/api/client'

function storyQueryString(filters: StoryFilters): string {
  const params: string[] = []

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
  const response = await apiGet<ApiResource<Category[]>>('/api/v1/categories')
  return response.data
}

export function getStories(filters: StoryFilters = {}): Promise<PaginatedStories> {
  return apiGet<PaginatedStories>(`/api/v1/stories${storyQueryString(filters)}`)
}

export async function getStory(slug: string): Promise<Story> {
  const response = await apiGet<ApiResource<Story>>(
    `/api/v1/stories/${encodeURIComponent(slug)}`,
  )
  return response.data
}

export async function getStoryCards(slug: string): Promise<StoryCard[]> {
  const response = await apiGet<ApiResource<StoryCard[]>>(
    `/api/v1/stories/${encodeURIComponent(slug)}/cards`,
  )
  return response.data
}

export async function getStoryProgress(
  childProfileId: number,
  slug: string,
): Promise<StoryProgress | null> {
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
