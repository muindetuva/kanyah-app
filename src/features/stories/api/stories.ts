import { apiGet } from '@/lib/api/client'

export type StoryCategory = {
  id: number
  name: string
  slug: string
}

export type StoryMedia = {
  alt: string
  height?: number | null
  id: number
  url?: string | null
  width?: number | null
}

export type FeedStory = {
  categories: StoryCategory[]
  coverImage: null | StoryMedia
  id: number
  maximumAge: number
  minimumAge: number
  publishedAt?: null | string
  slug: string
  summary: string
  title: string
}

export type StoryCard = {
  audio: null | StoryMedia
  content: string
  id: number
  image: null | StoryMedia
  position: number
}

export type StoryDetail = FeedStory & {
  cards: StoryCard[]
}

export type StoriesFeedResponse = {
  docs: FeedStory[]
  pagination: {
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
    page?: number | null
    totalDocs: number
    totalPages: number
  }
}

export function getStoriesFeed() {
  return apiGet<StoriesFeedResponse>('/api/v1/feed')
}

export function getStoryBySlug(slug: string) {
  return apiGet<StoryDetail>(`/api/v1/stories/${encodeURIComponent(slug)}`)
}
