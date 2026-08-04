import { router, useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { type ReactNode, useState } from 'react'
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '@/features/auth/context/auth-context'
import {
  ChildAppShell,
  ParentAppShell,
} from '@/features/navigation/components/child-app-shell'
import { CatalogMessage } from '@/features/stories/components/catalog-feedback'
import { StoryArtwork } from '@/features/stories/components/story-artwork'
import { useStory } from '@/features/stories/hooks/use-story-catalog'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

function StoryShell({ children }: { children: ReactNode }) {
  const { readerMode } = useAuth()

  return readerMode === 'parent' ? (
    <ParentAppShell activeTab="stories">{children}</ParentAppShell>
  ) : (
    <ChildAppShell activeTab="stories">{children}</ChildAppShell>
  )
}

function returnToLibrary() {
  if (router.canGoBack()) {
    router.back()
    return
  }

  router.navigate('/stories')
}

export default function StorySummaryScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const storyQuery = useStory(slug)
  const story = storyQuery.data
  const [favorite, setFavorite] = useState(false)

  if (storyQuery.isPending) {
    return (
      <StoryShell>
        <View style={styles.missingState}>
          <CatalogMessage body="Opening your story..." title="LOADING STORY" />
        </View>
      </StoryShell>
    )
  }

  if (storyQuery.isError || !story) {
    return (
      <StoryShell>
        <View style={styles.missingState}>
          <CatalogMessage
            body="This story could not be loaded from the library."
            onRetry={() => storyQuery.refetch()}
            title="STORY NOT FOUND"
          />
          <Pressable
            accessibilityRole="button"
            onPress={returnToLibrary}
            style={styles.returnButton}
          >
            <Text style={styles.returnButtonText}>BACK TO STORIES</Text>
          </Pressable>
        </View>
      </StoryShell>
    )
  }

  return (
    <StoryShell>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <StoryArtwork
            accessibilityLabel={story.coverImage?.alt ?? story.title}
            imageUrl={story.coverImage?.url}
            style={styles.heroArtwork}
          />
          <Pressable
            accessibilityLabel="Back to story library"
            accessibilityRole="button"
            onPress={returnToLibrary}
            style={({ pressed }) => [styles.roundButton, styles.backButton, pressed && styles.pressed]}
          >
            <SymbolView
              name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
              size={27}
              tintColor={appPalette.colors.brown[500]}
            />
          </Pressable>
        </View>

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{story.title.toUpperCase()}</Text>
            <Pressable
              accessibilityLabel={favorite ? 'Remove story from favorites' : 'Add story to favorites'}
              accessibilityRole="button"
              accessibilityState={{ selected: favorite }}
              onPress={() => setFavorite((current) => !current)}
              style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}
            >
              <SymbolView
                name={
                  favorite
                    ? { ios: 'heart.fill', android: 'favorite', web: 'favorite' }
                    : { ios: 'heart', android: 'favorite_border', web: 'favorite_border' }
                }
                size={25}
                tintColor={
                  favorite ? appPalette.colors.magenta[300] : appPalette.colors.brown[500]
                }
              />
            </Pressable>
          </View>

          <View style={styles.metadata}>
            {story.categories[0] ? (
              <View style={styles.pill}>
                <Text style={styles.pillText}>{story.categories[0].name}</Text>
              </View>
            ) : null}
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                Ages {story.minimumAge}-{story.maximumAge}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {story.chapterCount} {story.chapterCount === 1 ? 'Chapter' : 'Chapters'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text accessibilityElementsHidden style={styles.quoteMark}>
              ”
            </Text>
            <Text style={styles.summary}>{story.summary}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/stories/[slug]/read',
                params: { slug: story.slug },
              })
            }
            style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
          >
            <Text style={styles.startButtonText}>START READING</Text>
            <SymbolView
              name={{ ios: 'book.closed', android: 'menu_book', web: 'menu_book' }}
              size={20}
              tintColor={appColors.text.onPrimary}
            />
          </Pressable>
        </View>
      </ScrollView>
    </StoryShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 122,
  },
  hero: {
    position: 'relative',
    height: 330,
    overflow: 'hidden',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  heroArtwork: {
    width: '100%',
    height: '100%',
  },
  roundButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  details: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    color: appPalette.colors.neutral[1000],
    fontFamily: appTypography.displayFont,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 37,
  },
  favoriteButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: appPalette.grays.white,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 15,
  },
  pill: {
    borderRadius: 16,
    backgroundColor: appPalette.colors.purple[100],
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  pillText: {
    color: appColors.text.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  summaryCard: {
    position: 'relative',
    minHeight: 126,
    justifyContent: 'center',
    marginTop: 22,
    borderRadius: 20,
    backgroundColor: appPalette.grays.white,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  quoteMark: {
    position: 'absolute',
    top: -13,
    left: 2,
    color: appPalette.colors.neutral[300],
    fontFamily: appTypography.displayFont,
    fontSize: 58,
    lineHeight: 64,
  },
  summary: {
    color: appPalette.colors.neutral[700],
    fontSize: 16,
    lineHeight: 24,
  },
  startButton: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 30,
    borderRadius: 29,
    backgroundColor: appColors.actions.primary,
    boxShadow: '0 7px 16px rgba(90, 52, 28, 0.18)',
  },
  startButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  startButtonText: {
    color: appColors.text.onPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  missingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 24,
  },
  returnButton: {
    borderRadius: 24,
    backgroundColor: appColors.actions.primary,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  returnButtonText: {
    color: appColors.text.onPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
})
