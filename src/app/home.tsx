import { Image } from 'expo-image'
import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { ChildAppShell } from '@/features/navigation/components/child-app-shell'
import { useAuth } from '@/features/auth/context/auth-context'
import { ProfileAvatar } from '@/features/profiles/components/profile-avatar'
import { StoryArtwork } from '@/features/stories/components/story-artwork'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const jumaArtwork = require('../../assets/images/juma.png')

const categories = [
  {
    id: 'folklore',
    label: 'Folklore',
    backgroundColor: appPalette.colors.primary[100],
    color: appPalette.colors.primary[500],
    icon: {
      ios: 'theatermasks.fill' as const,
      android: 'theater_comedy' as const,
      web: 'theater_comedy' as const,
    },
  },
  {
    id: 'mystery',
    label: 'Mystery',
    backgroundColor: appPalette.colors.purple[100],
    color: appPalette.colors.purple[500],
    icon: {
      ios: 'magnifyingglass' as const,
      android: 'search' as const,
      web: 'search' as const,
    },
  },
  {
    id: 'adventure',
    label: 'Adventure',
    backgroundColor: appPalette.colors.magenta[100],
    color: appPalette.colors.magenta[500],
    icon: { ios: 'globe' as const, android: 'public' as const, web: 'public' as const },
  },
  {
    id: 'fairy',
    label: 'Fairy',
    backgroundColor: appPalette.colors.secondary[100],
    color: appPalette.colors.secondary[500],
    icon: {
      ios: 'sparkles' as const,
      android: 'auto_awesome' as const,
      web: 'auto_awesome' as const,
    },
  },
] as const

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.push('/stories')}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Text style={styles.seeAll}>See all</Text>
      </Pressable>
    </View>
  )
}

function FeaturedStory() {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/stories')}
      style={({ pressed }) => [styles.featuredCard, pressed && styles.pressed]}
    >
      <Image contentFit="cover" source={jumaArtwork} style={styles.featuredImage} />
      <View style={styles.featuredBody}>
        <View style={styles.featuredCopy}>
          <Text numberOfLines={2} style={styles.featuredTitle}>
            MVUA ILIYOIBA SIRI
          </Text>
          <Text style={styles.featuredMeta}>Continue reading • 15 min left</Text>
        </View>
        <View style={styles.playButton}>
          <SymbolView
            name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
            size={24}
            tintColor={appColors.text.onPrimary}
          />
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={styles.progressValue}>
          <View style={[styles.progressSegment, styles.progressMagenta]} />
          <View style={[styles.progressSegment, styles.progressOrange]} />
          <View style={[styles.progressSegment, styles.progressYellow]} />
        </View>
      </View>
    </Pressable>
  )
}

function StoryTile({ artwork, title }: { artwork: 'golden' | 'juma'; title: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/stories')}
      style={({ pressed }) => [styles.storyTile, pressed && styles.pressed]}
    >
      <View style={styles.storyArtworkFrame}>
        <StoryArtwork
          artwork={artwork === 'golden' ? 'golden-flute' : 'juma'}
          style={styles.storyArtwork}
        />
      </View>
      <Text numberOfLines={2} style={styles.storyTitle}>
        {title}
      </Text>
    </Pressable>
  )
}

export default function ChildHomeScreen() {
  const { activeProfile, isRestoring, user } = useAuth()

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
      return
    }

    if (!isRestoring && user && !activeProfile) {
      router.replace('/who-is-reading')
    }
  }, [activeProfile, isRestoring, user])

  const profileName = activeProfile?.display_name ?? 'Reader'
  const profileAvatar = activeProfile?.avatar_key ?? 'explorer'

  return (
    <ChildAppShell activeTab="home">
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.greeting}>
            KARIBU, {profileName.toUpperCase()}!
          </Text>
          <Pressable
            accessibilityLabel="Switch profile"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push('/who-is-reading')}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ProfileAvatar avatar={profileAvatar} size={44} />
          </Pressable>
        </View>

        <FeaturedStory />

        <View style={styles.section}>
          <SectionHeading title="Categories" />
          <ScrollView
            contentContainerStyle={styles.categoryList}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category) => (
              <Pressable
                accessibilityRole="button"
                key={category.id}
                onPress={() => router.push('/stories')}
                style={({ pressed }) => [styles.category, pressed && styles.pressed]}
              >
                <View
                  style={[
                    styles.categoryCircle,
                    { backgroundColor: category.backgroundColor },
                  ]}
                >
                  <SymbolView name={category.icon} size={31} tintColor={category.color} />
                </View>
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeading title="For you" />
          <ScrollView
            contentContainerStyle={styles.storyList}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <StoryTile artwork="golden" title="The Golden Flute" />
            <StoryTile artwork="juma" title="Mvua Iliyoiba Siri" />
          </ScrollView>
        </View>
      </ScrollView>
    </ChildAppShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 124,
  },
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  greeting: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0.2,
    lineHeight: 34,
  },
  featuredCard: {
    overflow: 'hidden',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 10px 24px rgba(90, 52, 28, 0.15)',
  },
  featuredImage: {
    width: '100%',
    height: 190,
  },
  featuredBody: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  featuredCopy: {
    flex: 1,
  },
  featuredTitle: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 33,
  },
  featuredMeta: {
    marginTop: 2,
    color: appPalette.colors.neutral[1000],
    fontSize: 15,
    lineHeight: 20,
  },
  playButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: appColors.actions.primary,
    boxShadow: '0 5px 12px rgba(90, 52, 28, 0.2)',
  },
  progressTrack: {
    height: 7,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 4,
    backgroundColor: appPalette.colors.neutral[200],
  },
  progressValue: {
    width: '62%',
    height: '100%',
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 4,
  },
  progressSegment: {
    flex: 1,
  },
  progressMagenta: {
    backgroundColor: appPalette.colors.magenta[300],
  },
  progressOrange: {
    backgroundColor: appPalette.colors.primary[300],
  },
  progressYellow: {
    backgroundColor: appPalette.colors.yellow[100],
  },
  section: {
    marginTop: 32,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: appPalette.colors.neutral[1000],
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 31,
  },
  seeAll: {
    color: appColors.actions.secondary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  categoryList: {
    gap: 18,
    paddingTop: 16,
    paddingHorizontal: 18,
    paddingBottom: 4,
  },
  category: {
    width: 84,
    alignItems: 'center',
  },
  categoryCircle: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: appPalette.grays.white,
    borderRadius: 38,
  },
  categoryLabel: {
    marginTop: 8,
    color: appPalette.colors.neutral[1000],
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  storyList: {
    gap: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  storyTile: {
    width: 198,
  },
  storyArtworkFrame: {
    width: '100%',
    height: 256,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: appPalette.colors.yellow[100],
  },
  storyArtwork: {
    width: '100%',
    height: '100%',
  },
  storyTitle: {
    marginTop: 9,
    paddingHorizontal: 4,
    color: appPalette.colors.neutral[1000],
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
})
