import { router, useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useState } from 'react'
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
import { getLocalStory } from '@/features/stories/data/local-stories'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

function ReadingPage({
  card,
  height,
  index,
  story,
}: {
  card: string
  height: number
  index: number
  story: NonNullable<ReturnType<typeof getLocalStory>>
}) {
  return (
    <View style={[styles.page, { height }]}>
      <Text style={styles.counter}>
        Screen {index + 1} of {story.cards.length}
      </Text>

      <View style={styles.readingCard}>
        <View style={styles.textPanel}>
          <Text style={styles.cardText}>{card}</Text>
        </View>
        <StoryArtwork artwork={story.artwork} style={styles.pageArtwork} />
      </View>

      <View accessibilityLabel={`Screen ${index + 1} of ${story.cards.length}`} style={styles.progress}>
        {story.cards.map((_item, dotIndex) => (
          <View
            key={`${story.slug}-progress-${dotIndex}`}
            style={[styles.progressDot, dotIndex === index && styles.progressDotActive]}
          />
        ))}
      </View>
    </View>
  )
}

export default function StoryReaderScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const story = getLocalStory(slug ?? '')
  const [pageHeight, setPageHeight] = useState(0)

  function returnToSummary() {
    router.replace({ pathname: '/stories/[slug]', params: { slug: slug ?? '' } })
  }

  function handleViewportLayout(event: LayoutChangeEvent) {
    const nextHeight = Math.round(event.nativeEvent.layout.height)

    if (nextHeight !== pageHeight) {
      setPageHeight(nextHeight)
    }
  }

  if (!story) {
    return (
      <MobileFrame
        backgroundColor={appPalette.colors.neutral[1000]}
        frameColor={appColors.backgrounds.secondary}
      >
        <KanyahScreenBackground>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.missingState}>
              <Text style={styles.missingTitle}>STORY NOT FOUND</Text>
              <Text style={styles.missingText}>This story is not in the local library yet.</Text>
              <Pressable onPress={() => router.replace('/stories')} style={styles.returnButton}>
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

          <View onLayout={handleViewportLayout} style={styles.readerViewport}>
            {pageHeight > 0 ? (
              <FlatList
                data={story.cards}
                decelerationRate="fast"
                getItemLayout={(_items, index) => ({
                  index,
                  length: pageHeight,
                  offset: pageHeight * index,
                })}
                keyExtractor={(_card, index) => `${story.slug}-${index}`}
                pagingEnabled
                renderItem={({ index, item }) => (
                  <ReadingPage card={item} height={pageHeight} index={index} story={story} />
                )}
                showsVerticalScrollIndicator={false}
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
    minHeight: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
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
    paddingBottom: 14,
  },
  counter: {
    color: appPalette.colors.neutral[600],
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  readingCard: {
    flex: 1,
    gap: 14,
    paddingTop: 14,
    paddingBottom: 12,
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
    flex: 1,
    minHeight: 280,
    borderRadius: 20,
  },
  progress: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
  pressed: {
    opacity: 0.72,
  },
})
