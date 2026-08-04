import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '@/features/auth/context/auth-context'
import type { ChildProfile } from '@/features/auth/types'
import { ParentAppShell } from '@/features/navigation/components/child-app-shell'
import { ProfileAvatar } from '@/features/profiles/components/profile-avatar'
import { StoryArtwork } from '@/features/stories/components/story-artwork'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

function UsageCard() {
  return (
    <View style={styles.usageCard}>
      <View style={styles.usageHeader}>
        <Text style={styles.usageText}>7 of 10 free stories used</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          disabled
        >
          <Text style={styles.upgradeText}>Upgrade</Text>
        </Pressable>
      </View>
      <View style={styles.progressTrack}>
        <View style={styles.progressValue} />
      </View>
    </View>
  )
}

function RecommendedStory({ childName }: { childName: string }) {
  return (
    <Pressable
      accessibilityLabel="Open Mfalme wa Mawingu"
      accessibilityRole="button"
      onPress={() => router.navigate('/stories')}
      style={({ pressed }) => [styles.storyCard, pressed && styles.pressed]}
    >
      <View style={styles.storyArtworkFrame}>
        <StoryArtwork artwork="night-kingdom" style={styles.storyArtwork} />
        <View style={styles.storyShade} />
        <View style={styles.storyOverlayCopy}>
          <Text style={styles.recommendationLabel}>
            RECOMMENDED FOR {childName.toUpperCase()}
          </Text>
          <Text numberOfLines={2} style={styles.storyTitle}>
            MFALME WA MAWINGU
          </Text>
        </View>
      </View>
      <View style={styles.storyMetaRow}>
        <Text style={styles.storyMeta}>15 min read • Adventure</Text>
        <View style={styles.playButton}>
          <SymbolView
            name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
            size={22}
            tintColor={appColors.text.onPrimary}
          />
        </View>
      </View>
    </Pressable>
  )
}

type ProfilesCardProps = {
  onSelectChild: (profile: ChildProfile) => void
  profiles: ChildProfile[]
}

function ProfilesCard({ onSelectChild, profiles }: ProfilesCardProps) {
  return (
    <View style={styles.profilesCard}>
      <Text style={styles.cardEyebrow}>PROFILES</Text>
      <ScrollView
        contentContainerStyle={styles.profileList}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {profiles.map((profile) => (
          <Pressable
            accessibilityLabel={`Open ${profile.display_name}'s home`}
            accessibilityRole="button"
            key={profile.id}
            onPress={() => onSelectChild(profile)}
            style={({ pressed }) => [styles.profileItem, pressed && styles.pressed]}
          >
            <ProfileAvatar avatar={profile.avatar_key} size={64} />
            <Text numberOfLines={1} style={styles.profileLabel}>
              {profile.display_name}
            </Text>
          </Pressable>
        ))}
        <View style={styles.profileItem}>
          <ProfileAvatar avatar="parent" selected size={64} />
          <Text style={styles.profileLabel}>Parent</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const parentActions = [
  {
    id: 'progress',
    label: 'Progress overview',
    icon: {
      ios: 'chart.bar.fill' as const,
      android: 'bar_chart' as const,
      web: 'bar_chart' as const,
    },
  },
  {
    id: 'account',
    label: 'Account & subscription',
    icon: {
      ios: 'person.badge.key.fill' as const,
      android: 'manage_accounts' as const,
      web: 'manage_accounts' as const,
    },
    route: '/account' as const,
  },
  {
    id: 'read',
    label: 'Read as myself',
    icon: {
      ios: 'figure.child' as const,
      android: 'child_care' as const,
      web: 'child_care' as const,
    },
    route: '/stories' as const,
  },
] as const

function ParentActions() {
  return (
    <View style={styles.actionCard}>
      {parentActions.map((action, index) => {
        const disabled = !('route' in action)

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            key={action.id}
            onPress={() => {
              if ('route' in action) {
                if (action.route === '/stories') {
                  router.navigate(action.route)
                } else {
                  router.push(action.route)
                }
              }
            }}
            style={({ pressed }) => [
              styles.actionRow,
              index > 0 && styles.actionRowBorder,
              pressed && styles.pressed,
            ]}
          >
            <SymbolView name={action.icon} size={20} tintColor={appPalette.colors.brown[500]} />
            <Text style={styles.actionLabel}>{action.label}</Text>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={18}
              tintColor={appPalette.colors.brown[500]}
            />
          </Pressable>
        )
      })}
    </View>
  )
}

export default function ParentHomeScreen() {
  const { isRestoring, readerMode, selectProfile, user } = useAuth()

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
      return
    }

    if (!isRestoring && user && readerMode !== 'parent') {
      router.replace('/who-is-reading')
    }
  }, [isRestoring, readerMode, user])

  function openChildHome(profile: ChildProfile) {
    selectProfile(profile)
    router.navigate('/home')
  }

  const parentName = user?.name.split(' ')[0] ?? 'Parent'
  const recommendationName = user?.child_profiles[0]?.display_name ?? 'your family'

  return (
    <ParentAppShell activeTab="home">
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.greeting}>
            KARIBU, {parentName.toUpperCase()}!
          </Text>
          <Pressable
            accessibilityLabel="Switch profile"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push('/who-is-reading')}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ProfileAvatar avatar="parent" selected size={46} />
          </Pressable>
        </View>

        <UsageCard />
        <RecommendedStory childName={recommendationName} />
        <ProfilesCard
          onSelectChild={openChildHome}
          profiles={user?.child_profiles ?? []}
        />
        <ParentActions />
      </ScrollView>
    </ParentAppShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    flex: 1,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 35,
  },
  usageCard: {
    gap: 11,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 8px 18px rgba(90, 52, 28, 0.1)',
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  usageText: {
    color: appPalette.colors.neutral[1000],
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  upgradeText: {
    color: appColors.actions.secondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  progressTrack: {
    height: 5,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: appPalette.colors.neutral[200],
  },
  progressValue: {
    width: '70%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: appPalette.colors.purple[300],
  },
  storyCard: {
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 10px 22px rgba(90, 52, 28, 0.14)',
  },
  storyArtworkFrame: {
    position: 'relative',
    height: 252,
    overflow: 'hidden',
  },
  storyArtwork: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  storyShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(34, 19, 55, 0.16)',
  },
  storyOverlayCopy: {
    position: 'absolute',
    right: 18,
    bottom: 17,
    left: 18,
  },
  recommendationLabel: {
    color: appColors.text.onPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    lineHeight: 15,
  },
  storyTitle: {
    marginTop: 4,
    color: appColors.text.onPrimary,
    fontFamily: appTypography.displayFont,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 33,
  },
  storyMetaRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  storyMeta: {
    color: appPalette.colors.neutral[1000],
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  playButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: appColors.actions.primary,
  },
  profilesCard: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 14,
    borderRadius: 18,
    backgroundColor: appPalette.grays.white,
  },
  cardEyebrow: {
    color: appPalette.colors.brown[500],
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 17,
  },
  profileList: {
    gap: 18,
    paddingTop: 13,
    paddingRight: 12,
  },
  profileItem: {
    width: 72,
    alignItems: 'center',
  },
  profileLabel: {
    width: '100%',
    marginTop: 7,
    color: appPalette.colors.neutral[1000],
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  },
  actionCard: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: appPalette.grays.white,
  },
  actionRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
  },
  actionRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: appPalette.colors.brown[100],
  },
  actionLabel: {
    flex: 1,
    color: appPalette.colors.neutral[1000],
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.72,
  },
})
