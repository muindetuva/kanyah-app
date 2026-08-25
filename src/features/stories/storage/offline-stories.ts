import { Platform } from 'react-native'

import type {
  Category,
  PaginatedStories,
  Story,
  StoryCard,
  StoryFilters,
} from '@/features/stories/types'

const OFFLINE_STORY_INDEX_KEY = 'kanyah.offlineStories'
const OFFLINE_STORY_KEY_PREFIX = 'kanyah.offlineStory.'
const OFFLINE_CATEGORIES_KEY = 'kanyah.offlineCategories'
const OFFLINE_CATALOG_KEY_PREFIX = 'kanyah.offlineCatalog.'
const STORY_ASSET_CACHE = 'kanyah-story-assets-v1'
const MAX_OFFLINE_STORIES = 3

type OfflineStoryRecord = {
  assets: string[]
  cards: StoryCard[]
  savedAt: string
  story: Story
}

function getWebStorage() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function readJson<T>(key: string): T | null {
  const value = getWebStorage()?.getItem(key)

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    getWebStorage()?.setItem(key, JSON.stringify(value))
  } catch {
    // Offline storage is an enhancement. Online reading must keep working if storage is full.
  }
}

function catalogKey(filters: StoryFilters) {
  return `${OFFLINE_CATALOG_KEY_PREFIX}${JSON.stringify({
    age: filters.age ?? null,
    category: filters.category ?? null,
    page: filters.page ?? 1,
    perPage: filters.perPage ?? 20,
    search: filters.search ?? null,
  })}`
}

function storyKey(slug: string) {
  return `${OFFLINE_STORY_KEY_PREFIX}${slug}`
}

function storyAssets(story: Story, cards: StoryCard[]) {
  return Array.from(
    new Set(
      [
        story.coverImage?.url,
        ...cards.flatMap((card) => [card.image?.url, card.narration?.url]),
      ].filter((url): url is string => Boolean(url)),
    ),
  )
}

async function cacheAsset(cache: Cache, url: string) {
  let response: Response

  try {
    response = await fetch(url, { credentials: 'omit' })
  } catch {
    response = await fetch(url, { credentials: 'omit', mode: 'no-cors' })
  }

  if (!response.ok && response.type !== 'opaque') {
    throw new Error(`Unable to save story asset: ${url}`)
  }

  await cache.put(url, response)
}

async function removeExpiredStories(activeSlugs: string[]) {
  const storage = getWebStorage()

  if (!storage || typeof window === 'undefined' || !('caches' in window)) {
    return
  }

  const previousSlugs = readJson<string[]>(OFFLINE_STORY_INDEX_KEY) ?? []
  const expiredSlugs = previousSlugs.filter((slug) => !activeSlugs.includes(slug))
  const retainedAssets = new Set(
    activeSlugs.flatMap((slug) => readJson<OfflineStoryRecord>(storyKey(slug))?.assets ?? []),
  )
  const cache = await window.caches.open(STORY_ASSET_CACHE)

  await Promise.all(
    expiredSlugs.map(async (slug) => {
      const record = readJson<OfflineStoryRecord>(storyKey(slug))
      storage.removeItem(storyKey(slug))

      await Promise.all(
        (record?.assets ?? [])
          .filter((url) => !retainedAssets.has(url))
          .map((url) => cache.delete(url)),
      )
    }),
  )
}

export function isBrowserOffline() {
  return Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.onLine
}

export function getOfflineStory(slug: string): Story | null {
  return readJson<OfflineStoryRecord>(storyKey(slug))?.story ?? null
}

export function getOfflineStoryCards(slug: string): StoryCard[] | null {
  return readJson<OfflineStoryRecord>(storyKey(slug))?.cards ?? null
}

export function isStoryAvailableOffline(
  slug: string,
  story?: Story,
  cards?: StoryCard[],
) {
  const record = readJson<OfflineStoryRecord>(storyKey(slug))

  if (!record) {
    return false
  }

  if (!story || !cards) {
    return true
  }

  return JSON.stringify(record.story) === JSON.stringify(story) &&
    JSON.stringify(record.cards) === JSON.stringify(cards)
}

export async function saveStoryForOffline(story: Story, cards: StoryCard[]) {
  if (
    Platform.OS !== 'web' ||
    typeof window === 'undefined' ||
    !('caches' in window) ||
    cards.length === 0
  ) {
    return false
  }

  const assets = storyAssets(story, cards)
  const cache = await window.caches.open(STORY_ASSET_CACHE)

  await Promise.all(assets.map((url) => cacheAsset(cache, url)))

  const currentSlugs = readJson<string[]>(OFFLINE_STORY_INDEX_KEY) ?? []
  const activeSlugs = [story.slug, ...currentSlugs.filter((slug) => slug !== story.slug)].slice(
    0,
    MAX_OFFLINE_STORIES,
  )

  writeJson(storyKey(story.slug), {
    assets,
    cards,
    savedAt: new Date().toISOString(),
    story,
  } satisfies OfflineStoryRecord)

  await removeExpiredStories(activeSlugs)
  writeJson(OFFLINE_STORY_INDEX_KEY, activeSlugs)

  return true
}

export function getOfflineCategories() {
  return readJson<Category[]>(OFFLINE_CATEGORIES_KEY)
}

export function saveOfflineCategories(categories: Category[]) {
  writeJson(OFFLINE_CATEGORIES_KEY, categories)
}

export function getOfflineCatalog(filters: StoryFilters) {
  return readJson<PaginatedStories>(catalogKey(filters))
}

export function saveOfflineCatalog(filters: StoryFilters, stories: PaginatedStories) {
  writeJson(catalogKey(filters), stories)
}
