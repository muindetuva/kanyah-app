import { Image } from 'expo-image'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import type { LocalStoryArtwork } from '@/features/stories/data/local-stories'

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
  artwork: LocalStoryArtwork
  style?: StyleProp<ViewStyle>
}

export function StoryArtwork({ artwork, style }: StoryArtworkProps) {
  return (
    <View style={[styles.frame, style]}>
      <Image contentFit="cover" source={artworkSources[artwork]} style={StyleSheet.absoluteFill} />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
})
