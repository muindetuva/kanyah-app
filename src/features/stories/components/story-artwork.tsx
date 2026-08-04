import { Image } from 'expo-image'
import { SymbolView } from 'expo-symbols'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import type { LocalStoryArtwork } from '@/features/stories/data/local-stories'
import { appPalette } from '@/theme/colors'

const artworkSources = {
  'daraja-la-msituni': require('../../../../assets/images/stories/daraja-la-msituni.jpg'),
  'golden-flute': require('../../../../assets/images/stories/the-golden-flute.jpg'),
  'hadithi-za-moto': require('../../../../assets/images/stories/hadithi-za-moto.jpg'),
  juma: require('../../../../assets/images/stories/mvua-iliyoiba-sauti.jpg'),
  'mtoto-wa-jua': require('../../../../assets/images/stories/mtoto-wa-jua.jpg'),
  'nias-bright-idea': require('../../../../assets/images/stories/nias-bright-idea.jpg'),
  'night-kingdom': require('../../../../assets/images/stories/mfalme-wa-mawingu.jpg'),
  'nyayo-za-usiku': require('../../../../assets/images/stories/nyayo-za-usiku.jpg'),
} as const satisfies Record<LocalStoryArtwork, number>

type StoryArtworkProps = {
  accessibilityLabel?: string
  artwork?: LocalStoryArtwork
  imageUrl?: string | null
  style?: StyleProp<ViewStyle>
}

export function StoryArtwork({
  accessibilityLabel,
  artwork,
  imageUrl,
  style,
}: StoryArtworkProps) {
  const source = imageUrl
    ? { uri: imageUrl }
    : artwork
      ? artworkSources[artwork]
      : undefined

  return (
    <View style={[styles.frame, style]}>
      {source ? (
        <Image
          accessibilityLabel={accessibilityLabel}
          contentFit="cover"
          source={source}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={styles.placeholder}>
          <SymbolView
            name={{ ios: 'book.closed.fill', android: 'menu_book', web: 'menu_book' }}
            size={42}
            tintColor={appPalette.colors.brown[300]}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appPalette.colors.primary[100],
  },
})
