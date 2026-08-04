import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

import { useAuth } from '@/features/auth/context/auth-context'
import {
  ChildAppShell,
  ParentAppShell,
} from '@/features/navigation/components/child-app-shell'
import { ProfileAvatar } from '@/features/profiles/components/profile-avatar'
import { StoryArtwork } from '@/features/stories/components/story-artwork'
import { type LocalStory, localStories } from '@/features/stories/data/local-stories'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const categories = ['Folklore', 'Adventure', 'Mystery', 'Fairy Tales'] as const

function LibraryHeader() {
  const { activeProfile, readerMode } = useAuth()

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Menu, coming soon"
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        disabled
        style={styles.menuButton}
      >
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
      </Pressable>

      <Text accessibilityRole="header" numberOfLines={1} style={styles.pageTitle}>
        STORY LIBRARY
      </Text>

      <Pressable
        accessibilityLabel="Switch profile"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.push('/who-is-reading')}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ProfileAvatar
          avatar={readerMode === 'parent' ? 'parent' : (activeProfile?.avatar_key ?? 'paw')}
          imageUrl={readerMode === 'parent' ? null : activeProfile?.avatar_url}
          size={44}
        />
      </Pressable>
    </View>
  )
}

function StoryCard({ story }: { story: LocalStory }) {
  return (
    <Pressable
      accessibilityLabel={`Read ${story.title}`}
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/stories/[slug]', params: { slug: story.slug } })
      }
      style={({ pressed }) => [styles.storyCard, pressed && styles.cardPressed]}
    >
      <View style={styles.artworkFrame}>
        <StoryArtwork artwork={story.artwork} style={styles.artwork} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{story.category.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.storyCopy}>
        <Text style={styles.storyTitle}>{story.title.toUpperCase()}</Text>
        <Text style={styles.storySummary}>{story.summary}</Text>
      </View>
    </Pressable>
  )
}

export default function StoryLibraryScreen() {
  const { readerMode } = useAuth()
  const [highlightedCategory, setHighlightedCategory] = useState<string>('Folklore')
  const [search, setSearch] = useState('')

  const visibleStories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    if (!query) {
      return localStories
    }

    return localStories.filter((story) =>
      `${story.title} ${story.summary} ${story.category}`.toLocaleLowerCase().includes(query),
    )
  }, [search])

  const content = (
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LibraryHeader />

        <ScrollView
          contentContainerStyle={styles.categoryList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => {
            const highlighted = category === highlightedCategory

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: highlighted }}
                key={category}
                onPress={() => setHighlightedCategory(category)}
                style={({ pressed }) => [
                  styles.categoryChip,
                  highlighted && styles.categoryChipHighlighted,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    highlighted && styles.categoryChipTextHighlighted,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <SymbolView
              name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              size={23}
              tintColor={appPalette.colors.brown[500]}
            />
            <TextInput
              accessibilityLabel="Search for a story"
              autoCapitalize="none"
              onChangeText={setSearch}
              placeholder="Search for story"
              placeholderTextColor={appPalette.colors.neutral[500]}
              returnKeyType="search"
              style={styles.searchInput}
              value={search}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              setHighlightedCategory('Folklore')
              setSearch('')
            }}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.allCategories}>All Categories</Text>
          </Pressable>
        </View>

        <View style={styles.storyList}>
          {visibleStories.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}

          {visibleStories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>NO STORY FOUND</Text>
              <Text style={styles.emptyText}>Try another title or category.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
  )

  return readerMode === 'parent' ? (
    <ParentAppShell activeTab="stories">{content}</ParentAppShell>
  ) : (
    <ChildAppShell activeTab="stories">{content}</ChildAppShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 124,
  },
  header: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  menuLine: {
    width: 17,
    height: 2,
    borderRadius: 1,
    backgroundColor: appPalette.colors.brown[500],
  },
  pageTitle: {
    flex: 1,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 31,
    textAlign: 'center',
  },
  categoryList: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  categoryChip: {
    minWidth: 104,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: appPalette.colors.brown[300],
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
    paddingHorizontal: 18,
  },
  categoryChipHighlighted: {
    borderColor: appColors.actions.primary,
    backgroundColor: appColors.actions.primary,
  },
  categoryChipText: {
    color: appPalette.colors.neutral[1000],
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  categoryChipTextHighlighted: {
    color: appColors.text.onPrimary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 22,
  },
  searchField: {
    height: 50,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 25,
    backgroundColor: appPalette.grays.white,
    paddingHorizontal: 16,
  },
  searchInput: {
    height: '100%',
    flex: 1,
    color: appPalette.colors.neutral[1000],
    fontSize: 16,
    lineHeight: 20,
  },
  allCategories: {
    color: appColors.actions.secondary,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  storyList: {
    gap: 18,
    paddingHorizontal: 16,
  },
  storyCard: {
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 6px 14px rgba(90, 52, 28, 0.16)',
  },
  cardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.992 }],
  },
  artworkFrame: {
    position: 'relative',
    height: 238,
    overflow: 'hidden',
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 18,
    backgroundColor: appPalette.colors.brown[300],
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  categoryBadgeText: {
    color: appColors.text.onPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 15,
  },
  storyCopy: {
    gap: 6,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 20,
  },
  storyTitle: {
    color: appPalette.colors.neutral[1000],
    fontFamily: appTypography.displayFont,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 31,
  },
  storySummary: {
    color: appPalette.colors.neutral[700],
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    backgroundColor: appPalette.grays.white,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyTitle: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 23,
    lineHeight: 28,
  },
  emptyText: {
    color: appPalette.colors.neutral[600],
    fontSize: 15,
    lineHeight: 21,
  },
  pressed: {
    opacity: 0.7,
  },
})
