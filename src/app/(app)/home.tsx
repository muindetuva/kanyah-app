import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { ChildAppShell } from '@/features/navigation/components/child-app-shell'
import { useAuth } from '@/features/auth/context/auth-context'
import { ProfileAvatar } from '@/features/profiles/components/profile-avatar'
import {
  CatalogMessage,
  StoryListSkeleton,
} from '@/features/stories/components/catalog-feedback'
import { StoryArtwork } from '@/features/stories/components/story-artwork'
import { useCategories, useStories } from '@/features/stories/hooks/use-story-catalog'
import type { Story } from '@/features/stories/types'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const categoryVisuals = [
  {
    backgroundColor: appPalette.colors.primary[100],
    color: appPalette.colors.primary[500],
    icon: {
      ios: 'theatermasks.fill' as const,
      android: 'theater_comedy' as const,
      web: 'theater_comedy' as const,
    },
  },
  {
    backgroundColor: appPalette.colors.purple[100],
    color: appPalette.colors.purple[500],
    icon: {
      ios: 'magnifyingglass' as const,
      android: 'search' as const,
      web: 'search' as const,
    },
  },
  {
    backgroundColor: appPalette.colors.magenta[100],
    color: appPalette.colors.magenta[500],
    icon: { ios: 'globe' as const, android: 'public' as const, web: 'public' as const },
  },
  {
    backgroundColor: appPalette.colors.secondary[100],
    color: appPalette.colors.secondary[500],
    icon: {
      ios: 'sparkles' as const,
      android: 'auto_awesome' as const,
      web: 'auto_awesome' as const,
    },
  },
] as const

function SectionHeading({ onSeeAll, title }: { onSeeAll: () => void; title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={onSeeAll}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Text style={styles.seeAll}>See all</Text>
      </Pressable>
    </View>
  )
}

function FeaturedStory({ story }: { story: Story }) {
  const category = story.categories[0]?.name ?? 'Story'

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/stories/[slug]', params: { slug: story.slug } })
      }
      style={({ pressed }) => [styles.featuredCard, pressed && styles.pressed]}
    >
      <StoryArtwork
        accessibilityLabel={story.coverImage?.alt ?? story.title}
        imageUrl={story.coverImage?.url}
        style={styles.featuredImage}
      />
      <View style={styles.featuredBody}>
        <View style={styles.featuredCopy}>
          <Text numberOfLines={2} style={styles.featuredTitle}>
            {story.title.toUpperCase()}
          </Text>
          <Text style={styles.featuredMeta}>
            {category} • Ages {story.minimumAge}-{story.maximumAge}
          </Text>
        </View>
        <View style={styles.playButton}>
          <SymbolView
            name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
            size={24}
            tintColor={appColors.text.onPrimary}
          />
        </View>
      </View>
    </Pressable>
  )
}

function StoryTile({ story }: { story: Story }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/stories/[slug]', params: { slug: story.slug } })
      }
      style={({ pressed }) => [styles.storyTile, pressed && styles.pressed]}
    >
      <View style={styles.storyArtworkFrame}>
        <StoryArtwork
          accessibilityLabel={story.coverImage?.alt ?? story.title}
          imageUrl={story.coverImage?.url}
          style={styles.storyArtwork}
        />
      </View>
      <Text numberOfLines={2} style={styles.storyTitle}>
        {story.title}
      </Text>
    </Pressable>
  )
}

export default function ChildHomeScreen() {
  const { activeProfile, isRestoring, readerMode, user } = useAuth()
  const categoriesQuery = useCategories()
  const storiesQuery = useStories({ perPage: 8 })

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
      return
    }

    if (!isRestoring && user && (readerMode !== 'child' || !activeProfile)) {
      router.replace('/who-is-reading')
    }
  }, [activeProfile, isRestoring, readerMode, user])

  const profileName = activeProfile?.display_name ?? 'Reader'
  const profileAvatar = activeProfile?.avatar_key ?? 'explorer'
  const categories = categoriesQuery.data ?? []
  const stories = storiesQuery.data?.data ?? []
  const featuredStory = stories[0]

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
            <ProfileAvatar
              avatar={profileAvatar}
              imageUrl={activeProfile?.avatar_url}
              size={44}
            />
          </Pressable>
        </View>

        {storiesQuery.isPending ? (
          <View style={styles.featuredLoading}>
            <StoryListSkeleton compact />
          </View>
        ) : null}
        {storiesQuery.isError ? (
          <View style={styles.sectionMessage}>
            <CatalogMessage
              body="We couldn't load today's stories."
              onRetry={() => storiesQuery.refetch()}
              title="STORIES ARE RESTING"
            />
          </View>
        ) : null}
        {featuredStory ? <FeaturedStory story={featuredStory} /> : null}

        <View style={styles.section}>
          <SectionHeading onSeeAll={() => router.push('/categories')} title="Categories" />
          <ScrollView
            contentContainerStyle={styles.categoryList}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category, index) => {
              const visual = categoryVisuals[index % categoryVisuals.length]

              return (
                <Pressable
                  accessibilityRole="button"
                  key={category.id}
                  onPress={() =>
                    router.push({ pathname: '/stories', params: { category: category.slug } })
                  }
                  style={({ pressed }) => [styles.category, pressed && styles.pressed]}
                >
                  <View
                    style={[
                      styles.categoryCircle,
                      { backgroundColor: visual.backgroundColor },
                    ]}
                  >
                    <SymbolView name={visual.icon} size={31} tintColor={visual.color} />
                  </View>
                  <Text style={styles.categoryLabel}>{category.name}</Text>
                </Pressable>
              )
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeading onSeeAll={() => router.navigate('/stories')} title="For you" />
          <ScrollView
            contentContainerStyle={styles.storyList}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {stories.slice(1, 5).map((story) => (
              <StoryTile key={story.id} story={story} />
            ))}
          </ScrollView>
          {storiesQuery.isSuccess && stories.length === 0 ? (
            <View style={styles.sectionMessage}>
              <CatalogMessage
                body="Stories will appear after they are published in the Kanyah portal."
                title="NO STORIES YET"
              />
            </View>
          ) : null}
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
  featuredLoading: {
    height: 330,
    overflow: 'hidden',
    marginTop: 12,
    marginHorizontal: 16,
  },
  sectionMessage: {
    marginHorizontal: 16,
    marginTop: 12,
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
