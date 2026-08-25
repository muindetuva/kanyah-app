import { Image } from 'expo-image'
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import { KanyahScreenBackground } from '@/components/kanyah-screen-background'
import { MobileFrame } from '@/components/mobile-frame'
import { appColors } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const verticalLogo = require('../../../../assets/images/kanyah-vertical-logo.svg')

export function SessionLoadingScreen() {
  return (
    <MobileFrame
      backgroundColor={appColors.backgrounds.primary}
      frameColor={appColors.backgrounds.secondary}
    >
      <KanyahScreenBackground>
        <SafeAreaView style={styles.safeArea}>
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="progressbar"
            style={styles.content}
          >
            <Image
              accessibilityLabel="Kanyah"
              contentFit="contain"
              source={verticalLogo}
              style={styles.logo}
            />
            <Text style={styles.label}>OPENING KANYAH</Text>
            <ActivityIndicator color={appColors.actions.primary} size="small" />
          </View>
        </SafeAreaView>
      </KanyahScreenBackground>
    </MobileFrame>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 18,
  },
  logo: {
    width: 112,
    height: 190,
  },
  label: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.4,
    lineHeight: 28,
  },
})
