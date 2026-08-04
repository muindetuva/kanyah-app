import { router, useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useCallback, useState } from 'react'
import type { ViewToken } from 'react-native'
import {
  FlatList,
  LayoutChangeEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { KanyahScreenBackground } from '@/components/kanyah-screen-background'
import { MobileFrame } from '@/components/mobile-frame'
import { StoryArtwork } from '@/features/stories/components/story-artwork'
import { useStory, useStoryCards } from '@/features/stories/hooks/use-story-catalog'
import type { Story, StoryCard } from '@/features/stories/types'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const storyViewabilityConfig = { itemVisiblePercentThreshold: 60 }

function ReadingPage({
  card,
  height,
  story,
}: {
  card: StoryCard
  height: number
  story: Story
}) {
  const artworkHeight = Math.min(420, Math.max(260, Math.round(height * 0.52)))

  return (
    <View style={[styles.page, { height }]}>
      <View style={styles.readingCard}>
        <View style={styles.textPanel}>
          <Text style={styles.cardText}>{card.content}</Text>
        </View>
        <StoryArtwork
          accessibilityLabel={card.image?.alt ?? story.coverImage?.alt ?? story.title}
          imageUrl={card.image?.url ?? story.coverImage?.url}
          style={[styles.pageArtwork, { height: artworkHeight }]}
        />
      </View>
    </View>
  )
}

export default function StoryReaderScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const storyQuery = useStory(slug)
  const cardsQuery = useStoryCards(slug)
  const story = storyQuery.data
  const cards = cardsQuery.data
  const [pageHeight, setPageHeight] = useState(0)
  const [activePage, setActivePage] = useState(0)
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<StoryCard>[] }) => {
      const nextPage = viewableItems[0]?.index

      if (nextPage !== null && nextPage !== undefined) {
        setActivePage(nextPage)
      }
    },
    [],
  )

  function returnToSummary() {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace({ pathname: '/stories/[slug]', params: { slug: slug ?? '' } })
  }

  function handleViewportLayout(event: LayoutChangeEvent) {
    const nextHeight = Math.round(event.nativeEvent.layout.height)

    if (nextHeight !== pageHeight) {
      setPageHeight(nextHeight)
    }
  }

  if (storyQuery.isPending || cardsQuery.isPending) {
    return (
      <MobileFrame
        backgroundColor={appPalette.colors.neutral[1000]}
        frameColor={appColors.backgrounds.secondary}
      >
        <KanyahScreenBackground>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.missingState}>
              <Text style={styles.missingTitle}>OPENING STORY</Text>
              <Text style={styles.missingText}>Getting the next part ready...</Text>
            </View>
          </SafeAreaView>
        </KanyahScreenBackground>
      </MobileFrame>
    )
  }

  if (storyQuery.isError || cardsQuery.isError || !story || !cards || cards.length === 0) {
    return (
      <MobileFrame
        backgroundColor={appPalette.colors.neutral[1000]}
        frameColor={appColors.backgrounds.secondary}
      >
        <KanyahScreenBackground>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.missingState}>
              <Text style={styles.missingTitle}>STORY UNAVAILABLE</Text>
              <Text style={styles.missingText}>This story is not ready to read yet.</Text>
              <Pressable
                onPress={() => {
                  storyQuery.refetch()
                  cardsQuery.refetch()
                }}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>TRY AGAIN</Text>
              </Pressable>
              <Pressable onPress={() => router.navigate('/stories')} style={styles.returnButton}>
                <Text style={styles.returnButtonText}>BACK TO STORIES</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </KanyahScreenBackground>
      </MobileFrame>
    )
  }

  return (
    <MobileFrame
      backgroundColor={appPalette.colors.neutral[1000]}
      frameColor={appColors.backgrounds.secondary}
    >
      <KanyahScreenBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Close reader and return to summary"
              accessibilityRole="button"
              onPress={returnToSummary}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                size={21}
                tintColor={appPalette.colors.brown[500]}
              />
            </Pressable>
            <Text numberOfLines={2} style={styles.title}>
              {story.title.toUpperCase()}
            </Text>
          </View>

          <View
            accessibilityLabel={`Story progress, section ${activePage + 1} of ${cards.length}`}
            accessibilityRole="progressbar"
            accessibilityValue={{
              max: cards.length,
              min: 1,
              now: activePage + 1,
            }}
            style={styles.progress}
          >
            {cards.map((card, dotIndex) => (
              <View
                key={`${story.slug}-progress-${card.id}`}
                style={[
                  styles.progressDot,
                  dotIndex === activePage && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <View onLayout={handleViewportLayout} style={styles.readerViewport}>
            {pageHeight > 0 ? (
              <FlatList
                data={cards}
                decelerationRate="fast"
                getItemLayout={(_items, index) => ({
                  index,
                  length: pageHeight,
                  offset: pageHeight * index,
                })}
                keyExtractor={(card) => `${story.slug}-${card.id}`}
                onViewableItemsChanged={handleViewableItemsChanged}
                pagingEnabled
                renderItem={({ item }) => (
                  <ReadingPage card={item} height={pageHeight} story={story} />
                )}
                showsVerticalScrollIndicator={false}
                viewabilityConfig={storyViewabilityConfig}
              />
            ) : null}
          </View>
        </SafeAreaView>
      </KanyahScreenBackground>
    </MobileFrame>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    flex: 1,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 32,
  },
  readerViewport: {
    flex: 1,
  },
  page: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  readingCard: {
    flex: 1,
    gap: 14,
    paddingTop: 10,
  },
  textPanel: {
    minHeight: 188,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: appPalette.grays.white,
    paddingHorizontal: 24,
    paddingVertical: 22,
    boxShadow: '0 5px 14px rgba(90, 52, 28, 0.1)',
  },
  cardText: {
    maxWidth: 310,
    color: appPalette.colors.neutral[1000],
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    textAlign: 'center',
  },
  pageArtwork: {
    width: '100%',
    borderRadius: 20,
  },
  progress: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  progressDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: appPalette.colors.purple[100],
  },
  progressDotActive: {
    width: 28,
    backgroundColor: appPalette.colors.brown[500],
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
  retryButton: {
    borderWidth: 2,
    borderColor: appColors.actions.secondary,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryButtonText: {
    color: appColors.actions.secondary,
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
  },
})
