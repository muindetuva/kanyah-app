import { Image } from 'expo-image'
import type { PropsWithChildren } from 'react'
import { StyleSheet, View } from 'react-native'

import { appColors } from '@/theme/colors'

const marigoldPattern = require('../../assets/images/marigold-bg.png')

export function KanyahScreenBackground({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill, styles.secondarySurface]} />
      <Image
        accessibilityElementsHidden
        contentFit="cover"
        contentPosition="center"
        source={marigoldPattern}
        style={[StyleSheet.absoluteFill, styles.pattern]}
      />
      <View
        accessibilityElementsHidden
        style={[StyleSheet.absoluteFill, styles.patternWash]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.backgrounds.primary,
    overflow: 'hidden',
  },
  secondarySurface: {
    backgroundColor: appColors.backgrounds.secondary,
    pointerEvents: 'none',
  },
  pattern: {
    height: '100%',
    pointerEvents: 'none',
    width: '100%',
  },
  patternWash: {
    backgroundColor: appColors.overlays.marigoldWash,
    opacity: 0.84,
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
  },
})
