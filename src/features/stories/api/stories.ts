import type { ApiResource } from '@/features/auth/types'
import type {
  Category,
  PaginatedStories,
  Story,
  StoryCard,
  StoryFilters,
} from '@/features/stories/types'
import { apiGet } from '@/lib/api/client'

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
