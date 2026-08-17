import type { ChildProfile } from '@/features/auth/types'
import type { StoryProgress } from '@/features/stories/types'

export type WeeklyReadingActivity = {
  activeSeconds: number
  date: string
  day: string
}

export type CategoryReadingProgress = {
  completed: number
  completionPercent: number
  id: number
  name: string
  slug: string
  started: number
}

export type EarnedProgressBadge = {
  artworkUrl: string | null
  description: string
  earnedAt: string | null
  id: number
  key: string
  name: string
}

export type ChildProgressOverview = {
  activeSeconds: number
  badgesEarned: number
  currentStreakDays: number
  lastActiveAt: string | null
  storiesCompleted: number
  storiesCompletedThisMonth: number
  storiesStarted: number
}

export type ChildProgressSummary = {
  categoryProgress: CategoryReadingProgress[]
  currentStory: StoryProgress | null
  overview: ChildProgressOverview
  profile: ChildProfile
  recentActivity: StoryProgress[]
  recentBadges: EarnedProgressBadge[]
  weeklyActivity: WeeklyReadingActivity[]
}
