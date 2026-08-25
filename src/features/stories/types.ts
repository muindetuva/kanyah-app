export type StoryImage = {
  alt: string
  height: number | null
  id: number
  url: string
  width: number | null
}

export type StoryCategory = {
  id: number
  name: string
  slug: string
}

export type Story = {
  categories: StoryCategory[]
  chapterCount: number
  coverImage: StoryImage | null
  id: number
  maximumAge: number
  minimumAge: number
  publishedAt: string | null
  slug: string
  summary: string
  title: string
}

export type StoryCard = {
  content: string
  id: number
  image: StoryImage | null
  narration: {
    url: string
  } | null
  position: number
}

export type StoryProgress = {
  childProfileId: number
  completedAt: string | null
  currentCardId: number
  currentCardPosition: number
  furthestCardPosition: number
  id: number
  lastReadAt: string
  startedAt: string
  status: 'completed' | 'in_progress'
  storyId: number
  story?: Story
}

export type ReadingSession = {
  activeSeconds: number
  childProfileId: number
  endedAt: string | null
  id: number
  lastActivityAt: string
  startedAt: string
  storyId: number
}

export type UnlockedBadge = {
  artworkUrl: string | null
  description: string
  id: number
  key: string
  name: string
}

export type StoryCompletion = {
  newBadges: UnlockedBadge[]
  pendingSync?: boolean
  progress: StoryProgress
}

export type Category = StoryCategory & {
  artwork: StoryImage | null
  featuredStory: Story | null
  position: number
}

export type PaginatedStories = {
  data: Story[]
  links: {
    first: string | null
    last: string | null
    next: string | null
    prev: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
}

export type StoryFilters = {
  age?: number
  category?: string
  page?: number
  perPage?: number
  search?: string
}
