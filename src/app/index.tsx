import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'

import { MobileFrame } from '@/components/mobile-frame'
import { type FeedStory, getStoriesFeed } from '@/features/stories/api/stories'
import { InstallKanyahPrompt } from '@/features/pwa/components/install-kanyah-prompt'

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

function FeedHeader() {
  return (
    <View style={styles.feedHeader}>
      <View style={styles.feedHeaderCopy}>
        <Text style={styles.feedBrand}>Kanyah</Text>
        <Text style={styles.feedHint}>Swipe for stories. Tap to read.</Text>
      </View>

      <Pressable accessibilityLabel="Parent profile, coming soon" accessibilityRole="button" style={styles.profileButton}>
        <Text style={styles.profileInitial}>P</Text>
      </Pressable>
    </View>
  )
}

function StoryPreview({ height, story }: { height: number; story: FeedStory }) {
  const categoryNames = story.categories.map((category) => category.name).join(' / ')

  return (
    <View style={[styles.slide, { minHeight: height }]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          router.push({
            pathname: '/stories/[slug]',
            params: {
              slug: story.slug,
            },
          })
        }}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardTop}>
          <Text style={styles.brand}>KANYAH</Text>
          <Text style={styles.ageRange}>
            Ages {story.minimumAge}-{story.maximumAge}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.categories}>{categoryNames || 'Story'}</Text>
          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.summary}>{story.summary}</Text>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.openLabel}>Read story</Text>
          <View style={styles.colorStack} accessibilityElementsHidden>
            <View style={[styles.colorBlock, styles.marigold]} />
            <View style={[styles.colorBlock, styles.magenta]} />
            <View style={[styles.colorBlock, styles.blue]} />
          </View>
        </View>
      </Pressable>
    </View>
  )
}

export default function HomeScreen() {
  const { height } = useWindowDimensions()
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['stories-feed'],
    queryFn: getStoriesFeed,
  })

  const stories = data?.docs ?? []
  const headerHeight = 84
  const slideHeight = Math.max(height - headerHeight - 48, 520)

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MobileFrame backgroundColor={colors.charcoal} frameColor={colors.offWhite}>
          <View style={styles.stateScreen}>
            <ActivityIndicator color={colors.indigo} size="large" />
          </View>
        </MobileFrame>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MobileFrame backgroundColor={colors.charcoal} frameColor={colors.offWhite}>
          <View style={styles.stateScreen}>
            <Text style={styles.stateTitle}>Stories are taking a minute.</Text>
            <Text style={styles.stateText}>
              {error instanceof Error ? error.message : 'Failed to load stories.'}
            </Text>
            <Pressable onPress={() => refetch()} style={styles.stateButton}>
              <Text style={styles.stateButtonText}>Try again</Text>
            </Pressable>
          </View>
        </MobileFrame>
      </SafeAreaView>
    )
  }

  if (stories.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MobileFrame backgroundColor={colors.charcoal} frameColor={colors.offWhite}>
          <View style={styles.stateScreen}>
            <Text style={styles.stateTitle}>Kanyah is warming up.</Text>
            <Text style={styles.stateText}>Published stories will appear here.</Text>
          </View>
        </MobileFrame>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <MobileFrame backgroundColor={colors.charcoal} frameColor={colors.offWhite}>
        <View style={styles.feedShell}>
          <FeedHeader />
          <FlatList
            data={stories}
            keyExtractor={(story) => story.slug}
            pagingEnabled
            renderItem={({ item }) => <StoryPreview height={slideHeight} story={item} />}
            showsVerticalScrollIndicator={false}
            snapToAlignment="start"
          />
          <InstallKanyahPrompt />
        </View>
      </MobileFrame>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  feedShell: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.offWhite,
  },
  feedHeader: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    borderBottomWidth: 3,
    borderBottomColor: colors.charcoal,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  feedHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  feedBrand: {
    color: colors.indigo,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 31,
  },
  feedHint: {
    color: colors.charcoal,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  profileButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 3,
    borderColor: colors.charcoal,
    borderRadius: 999,
    backgroundColor: colors.indigo,
  },
  profileInitial: {
    color: colors.offWhite,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 21,
  },
  slide: {
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  card: {
    flex: 1,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    borderWidth: 4,
    borderColor: colors.charcoal,
    borderRadius: 28,
    backgroundColor: colors.marigold,
    padding: 24,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  brand: {
    color: colors.indigo,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 32,
  },
  ageRange: {
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: colors.offWhite,
    color: colors.charcoal,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  cardBody: {
    gap: 16,
  },
  categories: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.magenta,
    color: colors.offWhite,
    paddingHorizontal: 13,
    paddingVertical: 7,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  title: {
    color: colors.charcoal,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 50,
  },
  summary: {
    maxWidth: 560,
    color: colors.charcoal,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 29,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  openLabel: {
    color: colors.indigo,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  colorStack: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.charcoal,
    borderRadius: 999,
  },
  colorBlock: {
    width: 30,
    height: 30,
  },
  marigold: {
    backgroundColor: colors.marigold,
  },
  magenta: {
    backgroundColor: colors.magenta,
  },
  blue: {
    backgroundColor: colors.blue,
  },
  stateScreen: {
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
  stateButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.indigo,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  stateButtonText: {
    color: colors.offWhite,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
})
