import { Image } from 'expo-image'
import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'

import { MobileFrame } from '@/components/mobile-frame'
import { joinWaitlist } from '@/features/waitlist/api/waitlist'

const colors = {
  charcoal: '#272827',
  headline: '#17100A',
  linkBlue: '#0088FF',
  orange: '#FF8A24',
  pink: '#FF2D55',
  palePeach: '#FCEBE4',
  purple: '#684EFF',
  purpleFooter: '#553265',
  purplePanel: '#754A70',
  green: '#34C759',
  trustPurple: '#D72BEF',
  warmBrown: '#A96E27',
  warmHeader: '#D4A060',
  white: '#FFFFFF',
  yellow: '#F7C96D',
}

const displayFont = Platform.select({
  android: 'sans-serif-condensed',
  ios: 'Arial Rounded MT Bold',
  web: "'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif",
  default: 'System',
})

const bodyFont = Platform.select({
  android: 'sans-serif',
  ios: 'Avenir Next',
  web: "'Avenir Next', Avenir, system-ui, sans-serif",
  default: 'System',
})

const jumaArtwork = require('../../assets/images/juma.png')
const kanyahLogo = require('../../assets/images/kanyah-logo.svg')
const kanyahLogoWhite = require('../../assets/images/kanyah-logo-white.svg')
const socialPlaceholder = require('../../assets/images/social-placeholder.svg')
const trustedByIcons = require('../../assets/images/trusted-by-icons.svg')
const yellowBackground = require('../../assets/images/yellow-box-bg.svg')
const headerHeight = 100

const howItWorksItems = [
  {
    accent: colors.orange,
    body: 'Access hundreds of curated African tales, from historical legends to modern-day adventures.',
    icon: require('../../assets/images/how-it-works/story-library.svg'),
    title: 'STORY LIBRARY',
  },
  {
    accent: colors.pink,
    body: 'Interactive narrations featuring authentic accents and immersive traditional soundscapes.',
    icon: require('../../assets/images/how-it-works/read-aloud.svg'),
    title: 'READ ALOUD',
  },
  {
    accent: colors.green,
    body: 'Celebrate every reading milestone with playful achievements that keep young readers inspired.',
    icon: require('../../assets/images/how-it-works/achievements.svg'),
    title: 'GROW & ACHIEVE',
  },
] as const

const footerGroups = [
  {
    links: ['Browse Stories', 'For Parents', 'How It Works'],
    title: 'PLATFORM',
  },
  {
    links: ['Privacy Policy', 'Terms', 'Cookies'],
    title: 'LEGAL',
  },
] as const

type TextileBackgroundProps = {
  count: number
  opacity?: number
}

function TextileBackground({ count, opacity = 1 }: TextileBackgroundProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.textileBackground, { opacity }]}
    >
      {Array.from({ length: count }, (_, index) => (
        <Image
          contentFit="fill"
          key={index}
          source={yellowBackground}
          style={styles.textileTile}
        />
      ))}
    </View>
  )
}

function MenuIcon() {
  return (
    <View accessibilityElementsHidden style={styles.menuIcon}>
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
      <View style={styles.menuLine} />
    </View>
  )
}

function PatternDivider() {
  return (
    <View accessibilityElementsHidden style={styles.patternDivider}>
      <Image contentFit="cover" source={yellowBackground} style={styles.patternDividerImage} />
    </View>
  )
}

export default function HomeScreen() {
  const { height: viewportHeight } = useWindowDimensions()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const waitlistPosition = useRef(0)
  const waitlistMutation = useMutation({
    mutationFn: joinWaitlist,
    onSuccess: () => {
      setEmail('')
    },
  })

  const submitWaitlist = () => {
    const normalizedEmail = email.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Enter a valid email address.')
      return
    }

    setEmailError(null)
    waitlistMutation.mutate({
      email: normalizedEmail,
      source: 'homepage',
    })
  }

  const waitlistStatus = emailError
    ? emailError
    : waitlistMutation.isSuccess
      ? 'You’re on the waitlist. We’ll let you know when Kanyah launches.'
      : waitlistMutation.isError
        ? 'We couldn’t save your email. Please try again.'
        : null

  return (
    <SafeAreaView style={styles.safeArea}>
      <MobileFrame backgroundColor={colors.charcoal} frameColor={colors.yellow}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.page}
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.header}>
            <TextileBackground count={1} opacity={0.22} />

            <Image
              accessibilityLabel="Kanyah"
              contentFit="contain"
              source={kanyahLogo}
              style={styles.logo}
            />

            <Pressable
              accessibilityLabel="Open menu"
              accessibilityRole="button"
              hitSlop={10}
              style={({ pressed }) => [styles.menuButton, pressed && styles.buttonPressed]}
            >
              <MenuIcon />
            </Pressable>
          </View>

          <View style={[styles.hero, { minHeight: Math.max(viewportHeight - headerHeight, 0) }]}>
            <TextileBackground count={5} />

            <View style={styles.heroContent}>
              <Text style={styles.eyebrow}>AFRICA&apos;S STORYTELLING PLATFORM</Text>

              <View style={styles.headlineGroup}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={styles.headline}>
                  STORIES THAT LIVE
                </Text>
                <Text adjustsFontSizeToFit numberOfLines={1} style={styles.headline}>
                  WITH YOU <Text style={styles.headlineAccent}>FOREVER</Text>
                </Text>
              </View>

              <Text style={styles.supportingCopy}>
                Empowering the next generation with vibrant digital libraries inspired by the rhythmic spirit of African folklore.
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  scrollViewRef.current?.scrollTo({ animated: true, y: waitlistPosition.current })
                }
                style={({ pressed }) => [styles.waitlistButton, pressed && styles.buttonPressed]}
              >
                <Text style={styles.waitlistButtonText}>JOIN WAITLIST</Text>
              </Pressable>

              <Image
                accessibilityLabel="Juma surrounded by flowing musical magic in an African village"
                contentFit="cover"
                source={jumaArtwork}
                style={styles.jumaArtwork}
              />
            </View>
          </View>

          <PatternDivider />

          <View style={styles.trustSection}>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.trustHeading}>
              TRUSTED BY PARENTS ACROSS AFRICA
            </Text>
            <Image
              accessibilityLabel="Trusted, safe, loved, and educational"
              contentFit="contain"
              source={trustedByIcons}
              style={styles.trustedByIcons}
            />
          </View>

          <PatternDivider />

          <View style={styles.howItWorksSection}>
            <Text style={styles.howItWorksHeading}>HOW IT WORKS</Text>
            <View style={styles.headingUnderline} />

            <View style={styles.cards}>
              {howItWorksItems.map((item) => (
                <View
                  key={item.title}
                  style={[styles.howItWorksCard, { borderBottomColor: item.accent }]}
                >
                  <Image
                    accessibilityElementsHidden
                    contentFit="contain"
                    source={item.icon}
                    style={styles.cardIcon}
                  />
                  <Text style={[styles.cardTitle, { color: item.accent }]}>{item.title}</Text>
                  <Text style={styles.cardBody}>{item.body}</Text>
                  <Text style={styles.readMore}>READ MORE →</Text>
                </View>
              ))}
            </View>
          </View>

          <PatternDivider />

          <View
            onLayout={(event) => {
              waitlistPosition.current = event.nativeEvent.layout.y
            }}
            style={styles.waitlistSection}
          >
            <TextileBackground count={4} opacity={0.1} />

            <View style={styles.waitlistContent}>
              <Text style={styles.waitlistHeading}>JOIN OUR WAITLIST</Text>
              <Text style={styles.waitlistCopy}>
                Be the first to know when we launch and get exclusive early access to our premium collection.
              </Text>

              <View style={styles.waitlistForm}>
                <TextInput
                  accessibilityLabel="Your email address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!waitlistMutation.isPending}
                  inputMode="email"
                  keyboardType="email-address"
                  onChangeText={(value) => {
                    setEmail(value)
                    setEmailError(null)
                    waitlistMutation.reset()
                  }}
                  onSubmitEditing={submitWaitlist}
                  placeholder="Your email address"
                  placeholderTextColor="#898183"
                  returnKeyType="done"
                  selectionColor={colors.purple}
                  style={styles.emailInput}
                  value={email}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: waitlistMutation.isPending || waitlistMutation.isSuccess,
                  }}
                  disabled={waitlistMutation.isPending || waitlistMutation.isSuccess}
                  onPress={submitWaitlist}
                  style={({ pressed }) => [
                    styles.waitlistSubmitButton,
                    pressed && styles.buttonPressed,
                    waitlistMutation.isSuccess && styles.waitlistSubmitButtonSuccess,
                  ]}
                >
                  <Text style={styles.waitlistSubmitText}>
                    {waitlistMutation.isPending
                      ? 'JOINING…'
                      : waitlistMutation.isSuccess
                        ? 'YOU’RE ON THE LIST'
                        : 'JOIN WAITLIST TODAY'}
                  </Text>
                </Pressable>

                {waitlistStatus ? (
                  <Text
                    accessibilityLiveRegion="polite"
                    style={[
                      styles.waitlistStatus,
                      (emailError || waitlistMutation.isError) && styles.waitlistStatusError,
                    ]}
                  >
                    {waitlistStatus}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <PatternDivider />

          <View style={styles.footer}>
            <TextileBackground count={5} opacity={0.07} />

            <View style={styles.footerContent}>
              <Image
                accessibilityLabel="Kanyah"
                contentFit="contain"
                source={kanyahLogoWhite}
                style={styles.footerLogo}
              />

              <Text style={styles.footerTagline}>
                Bringing the vibrant world of African storytelling to digital screens globally.
              </Text>

              <View style={styles.footerGroups}>
                {footerGroups.map((group) => (
                  <View key={group.title} style={styles.footerGroup}>
                    <Text style={styles.footerGroupTitle}>{group.title}</Text>
                    <View style={styles.footerRule} />
                    <View style={styles.footerLinks}>
                      {group.links.map((link) => (
                        <Text key={link} style={styles.footerLink}>
                          {link}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <Image
                accessibilityLabel="Website, share, and video links"
                contentFit="contain"
                source={socialPlaceholder}
                style={styles.socialLinks}
              />

              <Text style={styles.copyright}>
                © 2026 Kanyah, a MESRAC project. All rights reserved.
              </Text>
            </View>
          </View>

          <PatternDivider />
        </ScrollView>
      </MobileFrame>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.yellow,
  },
  page: {
    flexGrow: 1,
  },
  header: {
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warmHeader,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  textileBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  textileTile: {
    width: '100%',
    aspectRatio: 390 / 218,
    flexShrink: 0,
    marginBottom: -1,
  },
  logo: {
    width: 142,
    height: 84,
    zIndex: 1,
  },
  menuButton: {
    width: 46,
    height: 46,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  menuIcon: {
    width: 25,
    gap: 4,
  },
  menuLine: {
    width: 25,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.headline,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.yellow,
  },
  heroContent: {
    zIndex: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 72,
    paddingBottom: 70,
  },
  eyebrow: {
    color: colors.purple,
    fontFamily: bodyFont,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.25,
    lineHeight: 20,
    textAlign: 'center',
  },
  headlineGroup: {
    width: '100%',
    marginTop: 27,
  },
  headline: {
    color: colors.headline,
    fontFamily: displayFont,
    fontSize: 39,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 49,
    textAlign: 'center',
  },
  headlineAccent: {
    color: colors.purple,
  },
  supportingCopy: {
    maxWidth: 390,
    marginTop: 26,
    color: colors.warmBrown,
    fontFamily: bodyFont,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 31,
    textAlign: 'center',
  },
  waitlistButton: {
    width: '100%',
    maxWidth: 420,
    minHeight: 78,
    marginTop: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.orange,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  waitlistButtonText: {
    color: colors.white,
    fontFamily: displayFont,
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 36,
    textAlign: 'center',
  },
  jumaArtwork: {
    width: '100%',
    maxWidth: 420,
    aspectRatio: 356 / 266,
    marginTop: 56,
    overflow: 'hidden',
    borderRadius: 23,
  },
  patternDivider: {
    height: 15,
    overflow: 'hidden',
    backgroundColor: colors.yellow,
  },
  patternDividerImage: {
    width: '100%',
    height: 44,
  },
  trustSection: {
    alignItems: 'center',
    backgroundColor: colors.palePeach,
    paddingHorizontal: 22,
    paddingTop: 48,
    paddingBottom: 38,
  },
  trustHeading: {
    width: '100%',
    color: colors.trustPurple,
    fontFamily: bodyFont,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 22,
    textAlign: 'center',
  },
  trustedByIcons: {
    width: '100%',
    maxWidth: 358,
    aspectRatio: 358 / 68,
    marginTop: 25,
  },
  howItWorksSection: {
    alignItems: 'center',
    backgroundColor: colors.palePeach,
    paddingHorizontal: 18,
    paddingTop: 82,
    paddingBottom: 72,
  },
  howItWorksHeading: {
    color: colors.purple,
    fontFamily: displayFont,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 46,
    textAlign: 'center',
  },
  headingUnderline: {
    width: 116,
    height: 7,
    marginTop: 15,
    borderRadius: 999,
    backgroundColor: colors.orange,
  },
  cards: {
    width: '100%',
    maxWidth: 440,
    marginTop: 58,
    gap: 38,
  },
  howItWorksCard: {
    minHeight: 370,
    width: '100%',
    borderBottomWidth: 4,
    borderRadius: 20,
    backgroundColor: colors.white,
    paddingHorizontal: 38,
    paddingTop: 37,
    paddingBottom: 34,
    shadowColor: '#5D3526',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
  },
  cardIcon: {
    width: 68,
    height: 68,
  },
  cardTitle: {
    marginTop: 29,
    fontFamily: displayFont,
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 37,
  },
  cardBody: {
    marginTop: 17,
    color: '#5E5A59',
    fontFamily: bodyFont,
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 29,
  },
  readMore: {
    marginTop: 31,
    color: colors.linkBlue,
    fontFamily: bodyFont,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  waitlistSection: {
    minHeight: 590,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: colors.purplePanel,
    paddingHorizontal: 18,
    paddingTop: 94,
    paddingBottom: 94,
  },
  waitlistContent: {
    width: '100%',
    maxWidth: 440,
    zIndex: 1,
    alignItems: 'center',
  },
  waitlistHeading: {
    color: colors.white,
    fontFamily: displayFont,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 47,
    textAlign: 'center',
  },
  waitlistCopy: {
    maxWidth: 420,
    marginTop: 24,
    color: '#F5EAF1',
    fontFamily: bodyFont,
    fontSize: 21,
    fontWeight: '400',
    lineHeight: 32,
    textAlign: 'center',
  },
  waitlistForm: {
    width: '100%',
    marginTop: 49,
    gap: 22,
  },
  emailInput: {
    width: '100%',
    minHeight: 76,
    borderWidth: 1,
    borderColor: '#D7CED5',
    borderRadius: 999,
    backgroundColor: colors.white,
    color: colors.headline,
    fontFamily: bodyFont,
    fontSize: 17,
    lineHeight: 22,
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  waitlistSubmitButton: {
    width: '100%',
    minHeight: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#F7A521',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  waitlistSubmitButtonSuccess: {
    backgroundColor: colors.green,
  },
  waitlistSubmitText: {
    color: '#2E2162',
    fontFamily: bodyFont,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 28,
    textAlign: 'center',
  },
  waitlistStatus: {
    color: '#EAF8EE',
    fontFamily: bodyFont,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  waitlistStatusError: {
    color: '#FFE0E4',
  },
  footer: {
    minHeight: 720,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.purpleFooter,
    paddingHorizontal: 20,
    paddingTop: 82,
    paddingBottom: 54,
  },
  footerContent: {
    width: '100%',
    maxWidth: 440,
    zIndex: 1,
    alignSelf: 'center',
  },
  footerLogo: {
    width: 150,
    height: 105,
    marginLeft: -8,
  },
  footerTagline: {
    maxWidth: 420,
    marginTop: 3,
    color: '#F1E5EE',
    fontFamily: bodyFont,
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 32,
  },
  footerGroups: {
    width: '100%',
    flexDirection: 'row',
    gap: 44,
    marginTop: 56,
  },
  footerGroup: {
    flex: 1,
    minWidth: 0,
  },
  footerGroupTitle: {
    color: colors.white,
    fontFamily: bodyFont,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 25,
  },
  footerRule: {
    width: '100%',
    height: 1,
    marginTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  footerLinks: {
    marginTop: 25,
    gap: 24,
  },
  footerLink: {
    color: '#EADDE8',
    fontFamily: bodyFont,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  socialLinks: {
    width: '100%',
    maxWidth: 358,
    aspectRatio: 358 / 40,
    marginTop: 60,
  },
  copyright: {
    marginTop: 105,
    color: '#EADDE8',
    fontFamily: bodyFont,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
})
