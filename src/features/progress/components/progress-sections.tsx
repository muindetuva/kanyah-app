import { router } from 'expo-router'
import { Image } from 'expo-image'
import { SymbolView } from 'expo-symbols'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { ProfileAvatar } from '@/features/profiles/components/profile-avatar'
import type {
  CategoryReadingProgress,
  ChildProgressSummary,
  EarnedProgressBadge,
  WeeklyReadingActivity,
} from '@/features/progress/types'
import { StoryArtwork } from '@/features/stories/components/story-artwork'
import type { StoryProgress } from '@/features/stories/types'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const categoryColors = [
  appPalette.colors.purple[300],
  appPalette.colors.primary[300],
  appPalette.colors.brown[500],
  appPalette.colors.secondary[300],
]

function minutesFromSeconds(seconds: number): number {
  return Math.round(seconds / 60)
}

function relativeActivity(value: string | null): string {
  if (!value) {
    return 'No reading activity yet'
  }

  const activity = new Date(value)
  const today = new Date()
  const activityDay = new Date(activity.getFullYear(), activity.getMonth(), activity.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const days = Math.max(0, Math.round((todayDay.getTime() - activityDay.getTime()) / 86400000))

  if (days === 0) return 'Read today'
  if (days === 1) return 'Read yesterday'
  return `Read ${days} days ago`
}

function progressPercent(progress: StoryProgress): number {
  if (progress.status === 'completed') return 100

  const chapters = progress.story?.chapterCount ?? progress.furthestCardPosition
  return Math.min(100, Math.round((progress.furthestCardPosition / Math.max(1, chapters)) * 100))
}

export function ProgressOverviewCard({ summary }: { summary: ChildProgressSummary }) {
  const current = summary.currentStory

  return (
    <Pressable
      accessibilityLabel={`View ${summary.profile.display_name}'s reading progress`}
      accessibilityRole="button"
      onPress={() => router.push(`/analytics/${summary.profile.id}`)}
      style={({ pressed }) => [styles.overviewCard, pressed && styles.pressed]}
    >
      <View style={styles.overviewHeader}>
        <ProfileAvatar
          avatar={summary.profile.avatar_key}
          imageUrl={summary.profile.avatar_url}
          size={58}
        />
        <View style={styles.overviewIdentity}>
          <Text style={styles.profileName}>{summary.profile.display_name.toUpperCase()}</Text>
          <View style={styles.chipRow}>
            <Text style={styles.levelChip}>{summary.overview.storiesCompleted} STORIES FINISHED</Text>
            <Text style={styles.streakChip}>🔥 {summary.overview.currentStreakDays}-DAY STREAK</Text>
          </View>
        </View>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={20}
          tintColor={appPalette.colors.brown[500]}
        />
      </View>

      {current?.story ? (
        <View style={styles.currentStoryRow}>
          <StoryArtwork
            accessibilityLabel={current.story.coverImage?.alt ?? current.story.title}
            imageUrl={current.story.coverImage?.url}
            style={styles.currentStoryArtwork}
          />
          <View style={styles.currentStoryCopy}>
            <Text style={styles.eyebrow}>CURRENTLY READING</Text>
            <Text numberOfLines={2} style={styles.currentStoryTitle}>
              {current.story.title}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noCurrentStory}>No story in progress. Completed stories still appear in activity.</Text>
      )}

      <View style={styles.storyProgressTrack}>
        <View
          style={[
            styles.storyProgressValue,
            { width: `${current ? progressPercent(current) : 0}%` },
          ]}
        />
      </View>
    </Pressable>
  )
}

export function ChildProgressHero({ summary }: { summary: ChildProgressSummary }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroIdentity}>
        <ProfileAvatar
          avatar={summary.profile.avatar_key}
          imageUrl={summary.profile.avatar_url}
          selected
          size={96}
        />
        <Text style={styles.heroTitle}>{summary.profile.display_name.toUpperCase()}&apos;S JOURNEY</Text>
        <Text style={styles.heroSubtitle}>{relativeActivity(summary.overview.lastActiveAt)}</Text>
      </View>
      <View style={styles.metricStrip}>
        <Metric
          icon={{ ios: 'book.fill', android: 'menu_book', web: 'menu_book' }}
          label="STORIES"
          value={summary.overview.storiesCompleted}
        />
        <Metric
          icon={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }}
          label="MINUTES"
          value={minutesFromSeconds(summary.overview.activeSeconds)}
        />
        <Metric
          emphasized
          icon={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }}
          label="DAY STREAK"
          value={summary.overview.currentStreakDays}
        />
      </View>
    </View>
  )
}

function Metric({
  emphasized = false,
  icon,
  label,
  value,
}: {
  emphasized?: boolean
  icon: React.ComponentProps<typeof SymbolView>['name']
  label: string
  value: number
}) {
  return (
    <View style={[styles.metric, emphasized && styles.metricEmphasized]}>
      <SymbolView
        name={icon}
        size={21}
        tintColor={emphasized ? appColors.text.onPrimary : appPalette.colors.purple[400]}
      />
      <Text style={[styles.metricValue, emphasized && styles.metricTextEmphasized]}>{value}</Text>
      <Text style={[styles.metricLabel, emphasized && styles.metricTextEmphasized]}>{label}</Text>
    </View>
  )
}

export function RecentBadges({ badges }: { badges: EarnedProgressBadge[] }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Badges</Text>
        <Text style={styles.sectionMeta}>{badges.length > 0 ? `${badges.length} shown` : 'None yet'}</Text>
      </View>
      {badges.length > 0 ? (
        <ScrollView
          horizontal
          contentContainerStyle={styles.badgeList}
          showsHorizontalScrollIndicator={false}
        >
          {badges.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              {badge.artworkUrl ? (
                <Image
                  accessibilityLabel={`${badge.name} badge`}
                  contentFit="cover"
                  source={{ uri: badge.artworkUrl }}
                  style={styles.badgeArtwork}
                />
              ) : (
                <View style={[styles.badgeArtwork, styles.badgeFallback]}>
                  <SymbolView
                    name={{ ios: 'medal.fill', android: 'military_tech', web: 'military_tech' }}
                    size={32}
                    tintColor={appPalette.colors.primary[500]}
                  />
                </View>
              )}
              <Text numberOfLines={2} style={styles.badgeName}>{badge.name.toUpperCase()}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyCopy}>Badges will appear here as reading milestones are reached.</Text>
      )}
    </View>
  )
}

export function WeeklyReadingChart({ activity }: { activity: WeeklyReadingActivity[] }) {
  const maximum = Math.max(1, ...activity.map((day) => day.activeSeconds))

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Weekly Reading</Text>
        <Text style={styles.sectionMeta}>{minutesFromSeconds(activity.reduce((sum, day) => sum + day.activeSeconds, 0))} min</Text>
      </View>
      <View style={styles.chart}>
        {activity.map((day, index) => {
          const height = day.activeSeconds > 0
            ? Math.max(8, Math.round((day.activeSeconds / maximum) * 72))
            : 4

          return (
            <View
              accessibilityLabel={`${day.day}, ${minutesFromSeconds(day.activeSeconds)} reading minutes`}
              key={day.date}
              style={styles.chartColumn}
            >
              <View
                style={[
                  styles.chartBar,
                  { height },
                  index === activity.length - 1 && styles.chartBarToday,
                ]}
              />
              <Text style={styles.chartLabel}>{day.day.slice(0, 1)}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export function CategoryProgress({ categories }: { categories: CategoryReadingProgress[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Progress by Category</Text>
      {categories.length > 0 ? (
        <View style={styles.categoryList}>
          {categories.map((category, index) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryLabelRow}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryPercent}>{category.completionPercent}%</Text>
              </View>
              <View style={styles.categoryTrack}>
                <View
                  style={[
                    styles.categoryValue,
                    {
                      backgroundColor: categoryColors[index % categoryColors.length],
                      width: `${category.completionPercent}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyCopy}>Category progress begins with the first opened story.</Text>
      )}
    </View>
  )
}

export function RecentActivity({ activity }: { activity: StoryProgress[] }) {
  return (
    <View style={styles.activitySection}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {activity.length > 0 ? (
        <View style={styles.activityList}>
          {activity.map((progress) => {
            const story = progress.story
            if (!story) return null

            return (
              <Pressable
                accessibilityLabel={`Open ${story.title}`}
                accessibilityRole="button"
                key={progress.id}
                onPress={() => router.push({ pathname: '/stories/[slug]', params: { slug: story.slug } })}
                style={({ pressed }) => [styles.activityRow, pressed && styles.pressed]}
              >
                <StoryArtwork
                  accessibilityLabel={story.coverImage?.alt ?? story.title}
                  imageUrl={story.coverImage?.url}
                  style={styles.activityArtwork}
                />
                <View style={styles.activityCopy}>
                  <Text numberOfLines={2} style={styles.activityTitle}>{story.title.toUpperCase()}</Text>
                  <Text style={styles.activityMeta}>
                    {progress.status === 'completed' ? '✓ Completed' : `${progressPercent(progress)}% read`} · {relativeActivity(progress.lastReadAt)}
                  </Text>
                </View>
                <SymbolView
                  name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
                  size={18}
                  tintColor={appPalette.colors.purple[400]}
                />
              </Pressable>
            )
          })}
        </View>
      ) : (
        <Text style={styles.emptyCopy}>Completed and in-progress stories will appear here.</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  overviewCard: {
    gap: 13,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 253, 249, 0.94)',
    padding: 15,
    boxShadow: '0 7px 18px rgba(90, 52, 28, 0.13)',
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  overviewIdentity: {
    flex: 1,
    gap: 5,
  },
  profileName: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 22,
    lineHeight: 26,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  levelChip: {
    borderRadius: 10,
    backgroundColor: appPalette.colors.purple[100],
    color: appPalette.colors.deepIndigo[500],
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '800',
  },
  streakChip: {
    borderRadius: 10,
    backgroundColor: appPalette.colors.primary[10],
    color: appPalette.colors.primary[500],
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '800',
  },
  currentStoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 15,
    backgroundColor: appPalette.colors.primary[10],
    padding: 9,
  },
  currentStoryArtwork: {
    width: 58,
    height: 48,
    borderRadius: 10,
  },
  currentStoryCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: appPalette.colors.brown[500],
    fontSize: 9,
    fontWeight: '900',
  },
  currentStoryTitle: {
    color: appPalette.colors.neutral[900],
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  noCurrentStory: {
    color: appColors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  storyProgressTrack: {
    height: 5,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: appPalette.colors.neutral[200],
  },
  storyProgressValue: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: appColors.actions.primary,
  },
  hero: {
    marginHorizontal: -16,
    marginTop: -4,
  },
  heroIdentity: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.44)',
  },
  heroTitle: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 30,
    lineHeight: 35,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: appColors.text.secondary,
    fontSize: 14,
  },
  metricStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -25,
    paddingHorizontal: 16,
  },
  metric: {
    minHeight: 108,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 253, 249, 0.97)',
    boxShadow: '0 6px 16px rgba(90, 52, 28, 0.12)',
  },
  metricEmphasized: {
    backgroundColor: appColors.actions.primary,
  },
  metricValue: {
    marginTop: 6,
    color: appPalette.colors.neutral[900],
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    marginTop: 2,
    color: appPalette.colors.brown[500],
    fontSize: 9,
    fontWeight: '900',
  },
  metricTextEmphasized: {
    color: appColors.text.onPrimary,
  },
  section: {
    gap: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 253, 249, 0.94)',
    padding: 16,
    boxShadow: '0 5px 14px rgba(90, 52, 28, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: appPalette.colors.neutral[900],
    fontSize: 20,
    fontWeight: '800',
  },
  sectionMeta: {
    color: appColors.actions.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeList: {
    gap: 14,
    paddingRight: 5,
  },
  badgeItem: {
    width: 82,
    alignItems: 'center',
  },
  badgeArtwork: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  badgeFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appPalette.colors.yellow[100],
  },
  badgeName: {
    marginTop: 7,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'center',
  },
  emptyCopy: {
    color: appColors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  chart: {
    height: 104,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  chartColumn: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  chartBar: {
    width: 16,
    borderRadius: 6,
    backgroundColor: appPalette.colors.purple[300],
  },
  chartBarToday: {
    backgroundColor: appColors.actions.primary,
  },
  chartLabel: {
    color: appPalette.colors.neutral[700],
    fontSize: 10,
    fontWeight: '700',
  },
  categoryList: {
    gap: 14,
  },
  categoryItem: {
    gap: 6,
  },
  categoryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryName: {
    color: appPalette.colors.neutral[900],
    fontSize: 13,
    fontWeight: '700',
  },
  categoryPercent: {
    color: appColors.text.secondary,
    fontSize: 12,
  },
  categoryTrack: {
    height: 7,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: appPalette.colors.neutral[200],
  },
  categoryValue: {
    height: '100%',
    borderRadius: 4,
  },
  activitySection: {
    gap: 12,
  },
  activityList: {
    gap: 9,
  },
  activityRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 253, 249, 0.95)',
    padding: 8,
    boxShadow: '0 4px 12px rgba(90, 52, 28, 0.08)',
  },
  activityArtwork: {
    width: 64,
    height: 58,
    borderRadius: 12,
  },
  activityCopy: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 15,
    lineHeight: 18,
  },
  activityMeta: {
    color: appColors.text.secondary,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.72,
  },
})
