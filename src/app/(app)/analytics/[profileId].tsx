import { router, useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '@/features/auth/context/auth-context'
import { ParentAppShell } from '@/features/navigation/components/child-app-shell'
import {
  CategoryProgress,
  ChildProgressHero,
  RecentActivity,
  RecentBadges,
  WeeklyReadingChart,
} from '@/features/progress/components/progress-sections'
import { useParentProgress } from '@/features/progress/hooks/use-parent-progress'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

export default function ChildProgressScreen() {
  const params = useLocalSearchParams<{ profileId?: string | string[] }>()
  const profileIdValue = Array.isArray(params.profileId) ? params.profileId[0] : params.profileId
  const profileId = Number(profileIdValue)
  const { isRestoring, readerMode, user } = useAuth()
  const progressQuery = useParentProgress(Boolean(user && readerMode === 'parent'))
  const summary = progressQuery.data?.find((item) => item.profile.id === profileId)

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    } else if (!isRestoring && user && readerMode !== 'parent') {
      router.replace('/who-is-reading')
    }
  }, [isRestoring, readerMode, user])

  return (
    <ParentAppShell activeTab="analytics">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Back to progress overview"
            accessibilityRole="button"
            onPress={() => router.navigate('/analytics')}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              size={21}
              tintColor={appPalette.colors.brown[500]}
            />
          </Pressable>
          <Text accessibilityRole="header" style={styles.title}>CHILD PROFILE</Text>
        </View>

        {progressQuery.isPending ? (
          <View style={styles.message}>
            <Text style={styles.messageTitle}>OPENING THEIR JOURNEY</Text>
            <Text style={styles.messageBody}>Gathering reading progress...</Text>
          </View>
        ) : null}

        {progressQuery.isError ? (
          <View style={styles.message}>
            <Text style={styles.messageTitle}>PROGRESS TOOK A BREAK</Text>
            <Text style={styles.messageBody}>We couldn&apos;t load this child&apos;s reading activity.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => progressQuery.refetch()}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryText}>TRY AGAIN</Text>
            </Pressable>
          </View>
        ) : null}

        {!progressQuery.isPending && !progressQuery.isError && !summary ? (
          <View style={styles.message}>
            <Text style={styles.messageTitle}>PROFILE NOT FOUND</Text>
            <Text style={styles.messageBody}>This profile is unavailable or no longer active.</Text>
          </View>
        ) : null}

        {summary ? (
          <>
            <ChildProgressHero summary={summary} />
            <RecentBadges badges={summary.recentBadges} />
            <WeeklyReadingChart activity={summary.weeklyActivity} />
            <CategoryProgress categories={summary.categoryProgress} />
            <RecentActivity activity={summary.recentActivity} />
          </>
        ) : null}
      </ScrollView>
    </ParentAppShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    minHeight: '100%',
    gap: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
  },
  title: {
    flex: 1,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 25,
    lineHeight: 30,
  },
  message: {
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 253, 249, 0.94)',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  messageTitle: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 22,
    textAlign: 'center',
  },
  messageBody: {
    color: appColors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: appColors.actions.primary,
    paddingHorizontal: 20,
  },
  retryText: {
    color: appColors.text.onPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
})
