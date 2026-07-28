import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Pressable, SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'

import { KanyahScreenBackground } from '@/components/kanyah-screen-background'
import { MobileFrame } from '@/components/mobile-frame'
import { appColors } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const verticalLogo = require('../../assets/images/kanyah-vertical-logo.svg')

export default function WelcomeScreen() {
  const { height } = useWindowDimensions()
  const isCompact = height < 760

  return (
    <MobileFrame
      backgroundColor={appColors.backgrounds.primary}
      frameColor={appColors.backgrounds.secondary}
    >
      <KanyahScreenBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.layout, isCompact && styles.layoutCompact]}>
            <View style={styles.intro}>
              <Image
                accessibilityLabel="Kanyah"
                contentFit="contain"
                source={verticalLogo}
                style={[styles.logo, isCompact && styles.logoCompact]}
              />

              <Text
                accessibilityRole="header"
                style={[styles.headline, isCompact && styles.headlineCompact]}
              >
                STORIES{`\n`}THAT LIVE{`\n`}WITH YOU
              </Text>
            </View>

            <View style={[styles.actions, isCompact && styles.actionsCompact]}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/signup')}
                style={({ pressed }) => [
                  styles.button,
                  styles.signUpButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.signUpLabel}>SIGN UP</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/login')}
                style={({ pressed }) => [
                  styles.button,
                  styles.logInButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.logInLabel}>LOG IN</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => router.push('/stories')}
                style={({ pressed }) => [styles.guestButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.guestLabel}>Continue as guest</Text>
              </Pressable>
            </View>
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
  layout: {
    flex: 1,
    width: '100%',
    maxWidth: 390,
    maxHeight: 884,
    paddingTop: 68,
    paddingRight: 24,
    paddingBottom: 52,
    paddingLeft: 24,
  },
  layoutCompact: {
    paddingTop: 28,
    paddingBottom: 12,
  },
  intro: {
    alignItems: 'center',
  },
  logo: {
    width: 126,
    height: 214,
  },
  logoCompact: {
    width: 100,
    height: 170,
  },
  headline: {
    marginTop: 68,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0.4,
    lineHeight: 49,
    textAlign: 'center',
  },
  headlineCompact: {
    marginTop: 28,
    fontSize: 30,
    lineHeight: 39,
  },
  actions: {
    width: '100%',
    marginTop: 'auto',
    gap: 16,
  },
  actionsCompact: {
    gap: 10,
  },
  button: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  signUpButton: {
    backgroundColor: appColors.actions.primary,
  },
  logInButton: {
    borderWidth: 2,
    borderColor: appColors.actions.secondary,
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    opacity: 0.78,
  },
  signUpLabel: {
    color: appColors.text.onPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  logInLabel: {
    color: appColors.actions.secondary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  guestButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestLabel: {
    color: appColors.text.secondary,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
})
