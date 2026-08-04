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
  position: number
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
  category?: string
  page?: number
  perPage?: number
  search?: string
}
