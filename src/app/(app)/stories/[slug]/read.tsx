import { router, useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { Image } from 'expo-image'
import { useCallback, useRef, useState } from 'react'
import type { ViewToken } from 'react-native'
import {
  FlatList,
  LayoutChangeEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { KanyahScreenBackground } from '@/components/kanyah-screen-background'
import { MobileFrame } from '@/components/mobile-frame'
import { useAuth } from '@/features/auth/context/auth-context'
import { StoryArtwork } from '@/features/stories/components/story-artwork'
import { StoryNarrationPlayer } from '@/features/stories/components/story-narration-player'
import { useOfflineStory } from '@/features/stories/hooks/use-offline-story'
import { useReadingSession } from '@/features/stories/hooks/use-reading-session'
import {
  useStory,
  useStoryCards,
  useCompleteStory,
  useStoryProgress,
  useUpdateStoryProgress,
} from '@/features/stories/hooks/use-story-catalog'
import type { Story, StoryCard, StoryCompletion } from '@/features/stories/types'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const storyViewabilityConfig = { itemVisiblePercentThreshold: 60 }
const readingCardGap = 14
const readingCardTopPadding = 10

type ReaderItem =
  | { card: StoryCard; id: string; kind: 'story' }
  | { id: 'story-ending'; kind: 'ending' }

function ReadingPage({
  card,
  height,
  story,
}: {
  card: StoryCard
  height: number
  story: Story
}) {
  const artwork = card.image ?? story.coverImage
  const storedArtworkAspectRatio =
    artwork?.width && artwork.height ? artwork.width / artwork.height : null
  const [readingArea, setReadingArea] = useState({ height: 0, width: 0 })
  const [textPanelHeight, setTextPanelHeight] = useState(0)
  const [loadedArtworkAspectRatio, setLoadedArtworkAspectRatio] = useState<number | null>(null)
  const artworkAspectRatio = loadedArtworkAspectRatio ?? storedArtworkAspectRatio ?? 4 / 3
  const availableArtworkHeight = Math.max(
    0,
    readingArea.height - readingCardTopPadding - textPanelHeight - readingCardGap,
  )
  const naturalArtworkHeight = readingArea.width / artworkAspectRatio
  const artworkHeight = Math.min(naturalArtworkHeight, availableArtworkHeight)
  const artworkWidth = artworkHeight * artworkAspectRatio
  const hasMeasuredArtwork = artworkHeight > 0 && artworkWidth > 0

  return (
    <View style={[styles.page, card.narration && styles.pageWithNarration, { height }]}>
      <View
        onLayout={({ nativeEvent }) => {
          const nextHeight = Math.round(nativeEvent.layout.height)
          const nextWidth = Math.round(nativeEvent.layout.width)

          setReadingArea((current) =>
            current.height === nextHeight && current.width === nextWidth
              ? current
              : { height: nextHeight, width: nextWidth },
          )
        }}
        style={styles.readingCard}
      >
        <View
          onLayout={({ nativeEvent }) => {
            const nextHeight = Math.round(nativeEvent.layout.height)
            setTextPanelHeight((current) => (current === nextHeight ? current : nextHeight))
          }}
          style={styles.textPanel}
        >
          <Text style={styles.cardText}>{card.content}</Text>
        </View>
        <StoryArtwork
          accessibilityLabel={card.image?.alt ?? story.coverImage?.alt ?? story.title}
          contentFit="contain"
          imageUrl={card.image?.url ?? story.coverImage?.url}
          onAspectRatioResolved={setLoadedArtworkAspectRatio}
          style={[
            styles.pageArtwork,
            hasMeasuredArtwork
              ? { height: artworkHeight, width: artworkWidth }
              : { aspectRatio: artworkAspectRatio },
          ]}
        />
      </View>
    </View>
  )
}

function StoryEndingPage({
  completion,
  height,
  isError,
  isPending,
  onBackHome,
  onRetry,
  story,
}: {
  completion?: StoryCompletion
  height: number
  isError: boolean
  isPending: boolean
  onBackHome: () => void
  onRetry: () => void
  story: Story
}) {
  const newBadges = completion?.newBadges ?? []

  return (
    <View style={[styles.page, styles.endingPage, { height }]}>
      <View style={styles.completionMark}>
        <SymbolView
          name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
          size={38}
          tintColor={appColors.text.onPrimary}
        />
      </View>
      <Text accessibilityRole="header" style={styles.endingTitle}>
        YOU DID IT!
      </Text>
      <Text style={styles.endingStoryTitle}>{story.title.toUpperCase()}</Text>
      <Text style={styles.endingBody}>Another story now lives in your imagination.</Text>

      {completion?.pendingSync ? (
        <View accessibilityLiveRegion="polite" style={styles.offlineCompletion}>
          <SymbolView
            name={{ ios: 'icloud.and.arrow.up', android: 'cloud_upload', web: 'cloud_upload' }}
            size={18}
            tintColor={appColors.actions.secondary}
          />
          <Text style={styles.offlineCompletionText}>
            Saved on this device. We&apos;ll sync when you&apos;re back online.
          </Text>
        </View>
      ) : null}

      {isPending ? <Text style={styles.savingText}>SAVING YOUR JOURNEY...</Text> : null}

      {isError ? (
        <View style={styles.completionError}>
          <Text style={styles.completionErrorText}>We couldn&apos;t save this just yet.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryButtonText}>TRY AGAIN</Text>
          </Pressable>
        </View>
      ) : null}

      {!isPending && !isError && newBadges.length > 0 ? (
        <View style={styles.unlockedSection}>
          <Text style={styles.unlockedLabel}>
            {newBadges.length === 1 ? 'NEW BADGE UNLOCKED' : 'NEW BADGES UNLOCKED'}
          </Text>
          <ScrollView
            horizontal
            contentContainerStyle={styles.unlockedBadges}
            showsHorizontalScrollIndicator={false}
          >
            {newBadges.map((badge) => (
              <View key={badge.id} style={styles.unlockedBadge}>
                {badge.artworkUrl ? (
                  <Image
                    accessibilityLabel={`${badge.name} badge`}
                    contentFit="cover"
                    source={{ uri: badge.artworkUrl }}
                    style={styles.unlockedArtwork}
                  />
                ) : (
                  <View style={[styles.unlockedArtwork, styles.badgeFallback]}>
                    <SymbolView
                      name={{ ios: 'medal.fill', android: 'military_tech', web: 'military_tech' }}
                      size={40}
                      tintColor={appPalette.colors.primary[500]}
                    />
                  </View>
                )}
                <Text style={styles.unlockedName}>{badge.name.toUpperCase()}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {!isPending && !isError ? (
        <View style={styles.endingActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/stories')}
            style={({ pressed }) => [styles.primaryEndingButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryEndingButtonText}>READ ANOTHER STORY</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onBackHome}
            style={({ pressed }) => [styles.secondaryEndingButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryEndingButtonText}>BACK HOME</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

export default function StoryReaderScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const { activeProfile, readerMode } = useAuth()
  const trackingProfileId = readerMode === 'child' ? activeProfile?.id : undefined
  const storyQuery = useStory(slug)
  const cardsQuery = useStoryCards(slug)
  const progressQuery = useStoryProgress(trackingProfileId, slug)
  const { mutate: updateProgress } = useUpdateStoryProgress(trackingProfileId, slug)
  const {
    data: completion,
    isError: completionIsError,
    isPending: completionIsPending,
    mutate: completeStory,
  } = useCompleteStory(trackingProfileId, slug)
  const story = storyQuery.data
  const cards = cardsQuery.data
  useOfflineStory(story, cards)
  const [pageHeight, setPageHeight] = useState(0)
  const [activePage, setActivePage] = useState(0)
  const readerListRef = useRef<FlatList<ReaderItem> | null>(null)
  const completionRequested = useRef(false)
  useReadingSession({
    childProfileId: trackingProfileId,
    enabled: Boolean(story && cards?.length && activePage < (cards?.length ?? 0)),
    slug,
  })
  const lastTrackedCardId = useRef<number | null>(null)
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ReaderItem>[] }) => {
      const nextPage = viewableItems[0]?.index
      const visibleItem = viewableItems[0]?.item

      if (nextPage !== null && nextPage !== undefined) {
        setActivePage(nextPage)
      }

      if (trackingProfileId && visibleItem?.kind === 'story') {
        if (lastTrackedCardId.current !== visibleItem.card.id) {
          lastTrackedCardId.current = visibleItem.card.id
          updateProgress(visibleItem.card.id)
        }
      }

      if (
        trackingProfileId &&
        visibleItem?.kind === 'ending' &&
        !completionRequested.current
      ) {
        completionRequested.current = true
        completeStory()
      }
    },
    [completeStory, trackingProfileId, updateProgress],
  )
  const handleNarrationFinished = useCallback(() => {
    if (!cards?.length || activePage >= cards.length) {
      return
    }

    readerListRef.current?.scrollToIndex({
      animated: true,
      index: Math.min(activePage + 1, cards.length),
    })
  }, [activePage, cards])

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

  if (
    storyQuery.isPending ||
    cardsQuery.isPending ||
    (trackingProfileId && progressQuery.isPending)
  ) {
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

  const savedCardIndex =
    progressQuery.data?.status === 'in_progress'
      ? cards.findIndex((card) => card.id === progressQuery.data?.currentCardId)
      : -1
  const initialCardIndex = Math.max(0, savedCardIndex)
  const readerItems: ReaderItem[] = [
    ...cards.map((card) => ({ card, id: `story-card-${card.id}`, kind: 'story' as const })),
    { id: 'story-ending', kind: 'ending' },
  ]
  const activeCard = activePage < cards.length ? cards[activePage] : undefined

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
            accessibilityLabel={
              activePage === cards.length
                ? 'Story complete'
                : `Story progress, section ${activePage + 1} of ${cards.length}`
            }
            accessibilityRole="progressbar"
            accessibilityValue={{
              max: cards.length + 1,
              min: 1,
              now: activePage + 1,
            }}
            style={styles.progress}
          >
            {readerItems.map((item, dotIndex) => (
              <View
                key={`${story.slug}-progress-${item.id}`}
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
                ref={readerListRef}
                data={readerItems}
                decelerationRate="fast"
                disableIntervalMomentum
                getItemLayout={(_items, index) => ({
                  index,
                  length: pageHeight,
                  offset: pageHeight * index,
                })}
                keyExtractor={(item) => `${story.slug}-${item.id}`}
                initialScrollIndex={initialCardIndex}
                onViewableItemsChanged={handleViewableItemsChanged}
                pagingEnabled
                renderItem={({ item }) =>
                  item.kind === 'story' ? (
                    <ReadingPage card={item.card} height={pageHeight} story={story} />
                  ) : (
                    <StoryEndingPage
                      completion={completion}
                      height={pageHeight}
                      isError={completionIsError}
                      isPending={completionIsPending}
                      onBackHome={() =>
                        router.replace(readerMode === 'parent' ? '/parent-home' : '/home')
                      }
                      onRetry={() => completeStory()}
                      story={story}
                    />
                  )
                }
                showsVerticalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={pageHeight}
                viewabilityConfig={storyViewabilityConfig}
              />
            ) : null}
          </View>

          {activeCard?.narration ? (
            <View pointerEvents="box-none" style={styles.narrationOverlay}>
              <StoryNarrationPlayer
                narrationKey={activeCard.id}
                narrationUrl={activeCard.narration.url}
                onFinished={handleNarrationFinished}
              />
            </View>
          ) : null}
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
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
  },
  readerViewport: {
    flex: 1,
  },
  page: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  pageWithNarration: {
    paddingBottom: 88,
  },
  readingCard: {
    flex: 1,
    gap: readingCardGap,
    paddingTop: readingCardTopPadding,
  },
  textPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: appPalette.grays.white,
    paddingHorizontal: 24,
    paddingVertical: 22,
    boxShadow: '0 5px 14px rgba(90, 52, 28, 0.1)',
  },
  cardText: {
    width: '100%',
    color: appPalette.colors.neutral[1000],
    fontSize: 19,
    fontWeight: '500',
    lineHeight: 27,
    textAlign: 'left',
  },
  pageArtwork: {
    alignSelf: 'center',
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
  narrationOverlay: {
    position: 'absolute',
    right: 16,
    bottom: 18,
    left: 16,
    alignItems: 'flex-end',
  },
  endingPage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
    paddingBottom: 30,
  },
  completionMark: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    backgroundColor: appColors.actions.primary,
    boxShadow: '0 9px 20px rgba(241, 96, 34, 0.24)',
  },
  endingTitle: {
    marginTop: 20,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
    textAlign: 'center',
  },
  endingStoryTitle: {
    maxWidth: 330,
    marginTop: 6,
    color: appPalette.colors.primary[400],
    fontFamily: appTypography.displayFont,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
    textAlign: 'center',
  },
  endingBody: {
    maxWidth: 290,
    marginTop: 10,
    color: appColors.text.secondary,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  savingText: {
    marginTop: 30,
    color: appPalette.colors.purple[400],
    fontSize: 13,
    fontWeight: '900',
  },
  offlineCompletion: {
    maxWidth: 310,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 20,
  },
  offlineCompletionText: {
    flexShrink: 1,
    color: appColors.text.secondary,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  unlockedSection: {
    alignItems: 'center',
    marginTop: 25,
  },
  unlockedLabel: {
    color: appPalette.colors.purple[400],
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  unlockedBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 12,
  },
  unlockedBadge: {
    width: 110,
    alignItems: 'center',
  },
  unlockedArtwork: {
    width: 84,
    height: 84,
    borderWidth: 4,
    borderColor: appPalette.grays.white,
    borderRadius: 42,
    boxShadow: '0 6px 16px rgba(90, 52, 28, 0.16)',
  },
  badgeFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appPalette.colors.yellow[100],
  },
  unlockedName: {
    marginTop: 7,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
    textAlign: 'center',
  },
  completionError: {
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  completionErrorText: {
    color: appPalette.colors.red[200],
    fontSize: 14,
    lineHeight: 20,
  },
  endingActions: {
    width: '100%',
    gap: 10,
    marginTop: 28,
  },
  primaryEndingButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: appColors.actions.primary,
  },
  primaryEndingButtonText: {
    color: appColors.text.onPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryEndingButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: appColors.actions.secondary,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
  },
  secondaryEndingButtonText: {
    color: appColors.actions.secondary,
    fontSize: 14,
    fontWeight: '900',
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
