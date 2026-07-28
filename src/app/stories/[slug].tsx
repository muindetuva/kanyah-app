import { router, useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useState } from 'react'
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native'

import { ChildAppShell } from '@/features/navigation/components/child-app-shell'
import { StoryArtwork } from '@/features/stories/components/story-artwork'
import { getLocalStory } from '@/features/stories/data/local-stories'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

export default function StorySummaryScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const story = getLocalStory(slug ?? '')
  const [favorite, setFavorite] = useState(false)

  if (!story) {
    return (
      <ChildAppShell activeTab="stories">
        <View style={styles.missingState}>
          <Text style={styles.missingTitle}>STORY NOT FOUND</Text>
          <Text style={styles.missingText}>This story is not in the local library yet.</Text>
          <Pressable onPress={() => router.replace('/stories')} style={styles.returnButton}>
            <Text style={styles.returnButtonText}>BACK TO STORIES</Text>
          </Pressable>
        </View>
      </ChildAppShell>
    )
  }

  return (
    <ChildAppShell activeTab="stories">
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <StoryArtwork artwork={story.artwork} style={styles.heroArtwork} />
          <Pressable
            accessibilityLabel="Back to story library"
            accessibilityRole="button"
            onPress={() => router.replace('/stories')}
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
            <View style={styles.pill}>
              <Text style={styles.pillText}>{story.category}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Ages 6-8</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{story.cards.length} Chapters</Text>
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
    </ChildAppShell>
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
  missingTitle: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 30,
    lineHeight: 36,
  },
  missingText: {
    color: appPalette.colors.neutral[700],
    fontSize: 16,
    lineHeight: 23,
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
