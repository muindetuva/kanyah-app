import { Pressable, StyleSheet, Text, View } from 'react-native'

import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

export function StoryListSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <View accessibilityLabel="Loading stories" style={compact ? styles.compactRow : styles.list}>
      {[0, 1].map((item) => (
        <View key={item} style={[styles.skeletonCard, compact && styles.compactCard]}>
          <View style={[styles.skeletonArtwork, compact && styles.compactArtwork]} />
          <View style={styles.skeletonCopy}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonLine} />
          </View>
        </View>
      ))}
    </View>
  )
}

type CatalogMessageProps = {
  body: string
  onRetry?: () => void
  title: string
}

export function CatalogMessage({ body, onRetry, title }: CatalogMessageProps) {
  return (
    <View style={styles.message}>
      <Text style={styles.messageTitle}>{title}</Text>
      <Text style={styles.messageBody}>{body}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryText}>TRY AGAIN</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 18,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 16,
  },
  skeletonCard: {
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: appPalette.grays.white,
  },
  compactCard: {
    width: 198,
  },
  skeletonArtwork: {
    height: 238,
    backgroundColor: appPalette.colors.primary[100],
  },
  compactArtwork: {
    height: 256,
  },
  skeletonCopy: {
    gap: 10,
    padding: 18,
  },
  skeletonTitle: {
    width: '68%',
    height: 18,
    borderRadius: 9,
    backgroundColor: appPalette.colors.neutral[200],
  },
  skeletonLine: {
    width: '88%',
    height: 12,
    borderRadius: 6,
    backgroundColor: appPalette.colors.neutral[100],
  },
  message: {
    alignItems: 'center',
    gap: 7,
    borderRadius: 20,
    backgroundColor: appPalette.grays.white,
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  messageTitle: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 23,
    lineHeight: 28,
    textAlign: 'center',
  },
  messageBody: {
    color: appPalette.colors.neutral[600],
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: appColors.actions.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryText: {
    color: appColors.text.onPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.74,
  },
})
