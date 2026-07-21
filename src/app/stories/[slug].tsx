import { useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'

import { MobileFrame } from '@/components/mobile-frame'
import { type StoryCard, getStoryBySlug } from '@/features/stories/api/stories'

const colors = {
  marigold: '#EF9E23',
  orange: '#F16022',
  blue: '#2671B8',
  magenta: '#D63575',
  purple: '#70439A',
  indigo: '#39205B',
  offWhite: '#F0EFEF',
  charcoal: '#272827',
  green: '#127D3E',
}

function StoryPage({
  card,
  height,
  index,
  total,
}: {
  card: StoryCard
  height: number
  index: number
  total: number
}) {
  return (
    <View style={[styles.page, { height }]}>
      <View style={styles.storyCard}>
        <Text style={styles.position}>
          {index + 1} / {total}
        </Text>
        <Text style={styles.cardText}>{card.content}</Text>
      </View>
    </View>
  )
}

export default function StoryReaderScreen() {
  const { height } = useWindowDimensions()
  const params = useLocalSearchParams<{ slug?: string | string[] }>()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const [currentIndex, setCurrentIndex] = useState(0)

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['story', slug],
    queryFn: () => getStoryBySlug(slug ?? ''),
    enabled: Boolean(slug),
  })

  function handleMomentumScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.y / readerPageHeight)
    setCurrentIndex(nextIndex)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <MobileFrame backgroundColor={colors.charcoal} frameColor={colors.offWhite}>
          <View style={styles.stateContent}>
            <ActivityIndicator color={colors.indigo} size="large" />
          </View>
        </MobileFrame>
      </SafeAreaView>
    )
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <MobileFrame backgroundColor={colors.charcoal} frameColor={colors.offWhite}>
          <View style={styles.stateContent}>
            <Text style={styles.stateTitle}>This story slipped away.</Text>
            <Text style={styles.stateText}>
              {error instanceof Error ? error.message : 'Failed to load this story.'}
            </Text>
            <View style={styles.stateActions}>
              <Pressable onPress={() => router.back()} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
              <Pressable onPress={() => refetch()} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Try again</Text>
              </Pressable>
            </View>
          </View>
        </MobileFrame>
      </SafeAreaView>
    )
  }

  const readerPageHeight = Math.max(height - 232, 420)

  return (
    <SafeAreaView style={styles.safeArea}>
      <MobileFrame backgroundColor={colors.charcoal} frameColor={colors.indigo}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.counter}>
            {currentIndex + 1} of {data.cards.length}
          </Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.category}>
            {data.categories.map((category) => category.name).join(' / ') || 'Story'}
          </Text>
          <Text style={styles.title}>{data.title}</Text>
        </View>

        <FlatList
          data={data.cards}
          getItemLayout={(_items, index) => ({
            index,
            length: readerPageHeight,
            offset: readerPageHeight * index,
          })}
          keyExtractor={(card) => String(card.id)}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          pagingEnabled
          renderItem={({ index, item }) => (
            <StoryPage card={item} height={readerPageHeight} index={index} total={data.cards.length} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </MobileFrame>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    borderRadius: 999,
    backgroundColor: colors.offWhite,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    color: colors.indigo,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 17,
  },
  counter: {
    color: colors.offWhite,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 17,
  },
  titleBlock: {
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  category: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.magenta,
    color: colors.offWhite,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 15,
  },
  title: {
    color: colors.offWhite,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 38,
  },
  page: {
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  storyCard: {
    minHeight: 320,
    maxHeight: 520,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    justifyContent: 'space-between',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: colors.charcoal,
    backgroundColor: colors.offWhite,
    padding: 26,
  },
  position: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.marigold,
    color: colors.charcoal,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  cardText: {
    color: colors.charcoal,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 40,
  },
  stateScreen: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  stateContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
    backgroundColor: colors.offWhite,
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: colors.indigo,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 38,
  },
  stateText: {
    color: colors.charcoal,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 25,
  },
  stateActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: colors.indigo,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.offWhite,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.indigo,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: colors.indigo,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
})
