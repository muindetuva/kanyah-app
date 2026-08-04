import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '@/features/auth/context/auth-context'
import {
  ChildAppShell,
  ParentAppShell,
} from '@/features/navigation/components/child-app-shell'
import { ProfileAvatar } from '@/features/profiles/components/profile-avatar'
import {
  CatalogMessage,
  StoryListSkeleton,
} from '@/features/stories/components/catalog-feedback'
import { StoryArtwork } from '@/features/stories/components/story-artwork'
import { useCategories } from '@/features/stories/hooks/use-story-catalog'
import type { Category } from '@/features/stories/types'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

function returnToLibrary() {
  if (router.canGoBack()) {
    router.back()
    return
  }

  router.navigate('/stories')
}

function CategoryCard({ category }: { category: Category }) {
  const featuredStory = category.featuredStory
  const artworkUrl = category.artwork?.url ?? featuredStory?.coverImage?.url

  return (
    <Pressable
      accessibilityLabel={`Browse ${category.name} stories`}
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/stories', params: { category: category.slug } })
      }
      style={({ pressed }) => [styles.categoryCard, pressed && styles.pressedCard]}
    >
      <StoryArtwork
        accessibilityLabel={category.artwork?.alt ?? `${category.name} category artwork`}
        imageUrl={artworkUrl}
        style={styles.categoryArtwork}
      />
      <View style={styles.artworkShade} />
      <Text style={styles.categoryName}>{category.name.toUpperCase()}</Text>

      {featuredStory ? (
        <View style={styles.featuredPanel}>
          <StoryArtwork
            accessibilityLabel={featuredStory.coverImage?.alt ?? featuredStory.title}
            imageUrl={featuredStory.coverImage?.url}
            style={styles.featuredArtwork}
          />
          <View style={styles.featuredCopy}>
            <Text style={styles.featuredLabel}>FEATURED</Text>
            <Text numberOfLines={1} style={styles.featuredTitle}>
              {featuredStory.title}
            </Text>
          </View>
          <View style={styles.playButton}>
            <SymbolView
              name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
              size={17}
              tintColor={appColors.text.onPrimary}
            />
          </View>
        </View>
      ) : (
        <View style={styles.featuredPanel}>
          <Text style={styles.noFeaturedStory}>Explore {category.name} stories</Text>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={18}
            tintColor={appColors.text.onPrimary}
          />
        </View>
      )}
    </Pressable>
  )
}

export default function CategoriesScreen() {
  const { activeProfile, readerMode } = useAuth()
  const categoriesQuery = useCategories()
  const categories = categoriesQuery.data ?? []

  const content = (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.menuButton}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </View>
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

      <View style={styles.headingRow}>
        <Text style={styles.heading}>Browse by Category</Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={returnToLibrary}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.backLink}>← Back</Text>
        </Pressable>
      </View>

      <View style={styles.categoryList}>
        {categoriesQuery.isPending ? <StoryListSkeleton /> : null}
        {categoriesQuery.isError ? (
          <CatalogMessage
            body="We couldn't load the categories."
            onRetry={() => categoriesQuery.refetch()}
            title="CATEGORIES ARE RESTING"
          />
        ) : null}
        {categoriesQuery.isSuccess
          ? categories.map((category) => (
              <CategoryCard category={category} key={category.id} />
            ))
          : null}
        {categoriesQuery.isSuccess && categories.length === 0 ? (
          <CatalogMessage
            body="Categories will appear here after they are added in the Kanyah portal."
            title="NO CATEGORIES YET"
          />
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
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  heading: {
    flex: 1,
    color: appPalette.colors.neutral[1000],
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 27,
  },
  backLink: {
    color: appColors.actions.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryList: {
    gap: 18,
    paddingHorizontal: 16,
  },
  categoryCard: {
    position: 'relative',
    height: 230,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderRadius: 20,
    backgroundColor: appPalette.colors.deepIndigo[500],
    boxShadow: '0 7px 16px rgba(49, 26, 73, 0.2)',
  },
  categoryArtwork: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  artworkShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(34, 19, 55, 0.38)',
  },
  categoryName: {
    position: 'absolute',
    top: 28,
    left: 18,
    color: appColors.text.onPrimary,
    fontFamily: appTypography.displayFont,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 36,
  },
  featuredPanel: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 14,
    borderRadius: 15,
    backgroundColor: 'rgba(77, 38, 111, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  featuredArtwork: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  featuredCopy: {
    flex: 1,
  },
  featuredLabel: {
    color: appPalette.colors.yellow[100],
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 12,
  },
  featuredTitle: {
    marginTop: 2,
    color: appColors.text.onPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  noFeaturedStory: {
    flex: 1,
    color: appColors.text.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  playButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pressed: {
    opacity: 0.7,
  },
  pressedCard: {
    opacity: 0.86,
    transform: [{ scale: 0.992 }],
  },
})
