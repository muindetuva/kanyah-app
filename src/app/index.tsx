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
  columns?: number
  count: number
  opacity?: number
}

function TextileBackground({ columns = 1, count, opacity = 1 }: TextileBackgroundProps) {
  const tileWidth = `${100 / columns}%` as `${number}%`

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.textileBackground, columns > 1 && styles.textileBackgroundGrid, { opacity }]}
    >
      {Array.from({ length: count * columns }, (_, index) => (
        <Image
          contentFit="fill"
          key={index}
          source={yellowBackground}
          style={[styles.textileTile, { width: tileWidth }]}
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

function PatternDivider({ columns = 1 }: { columns?: number }) {
  return (
    <View accessibilityElementsHidden style={styles.patternDivider}>
      {Array.from({ length: columns }, (_, index) => (
        <Image
          contentFit="cover"
          key={index}
          source={yellowBackground}
          style={styles.patternDividerImage}
        />
      ))}
    </View>
  )
}

export default function HomeScreen() {
  const { height: viewportHeight, width: viewportWidth } = useWindowDimensions()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const howItWorksPosition = useRef(0)
  const waitlistPosition = useRef(0)
  const isTablet = viewportWidth >= 700
  const isDesktop = viewportWidth >= 1024
  const isWideDesktop = viewportWidth >= 1280
  const patternColumns = isDesktop ? 3 : isTablet ? 2 : 1
  const responsiveHeaderHeight = isDesktop ? 116 : isTablet ? 108 : headerHeight
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

  const scrollTo = (position: number) => {
    setMenuOpen(false)
    scrollViewRef.current?.scrollTo({ animated: true, y: position })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <MobileFrame backgroundColor={colors.charcoal} frameColor={colors.yellow} responsive>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.page}
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={[styles.devBanner, isTablet && styles.devBannerTablet]}>
            <Text accessibilityRole="header" style={[styles.devBannerText, isTablet && styles.devBannerTextTablet]}>
              Dev version of Kanyah
            </Text>
          </View>

          <View style={[styles.header, isTablet && styles.headerTablet]}>
            <TextileBackground columns={patternColumns} count={1} opacity={0.22} />

            <View style={[styles.headerInner, isTablet && styles.headerInnerTablet]}>
              <Image
                accessibilityLabel="Kanyah"
                contentFit="contain"
                source={kanyahLogo}
                style={[styles.logo, isTablet && styles.logoTablet]}
              />

              {isDesktop ? (
                <View style={styles.desktopNavigation}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => scrollTo(howItWorksPosition.current)}
                    style={({ pressed }) => [styles.desktopNavLink, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.desktopNavLinkText}>HOW IT WORKS</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => scrollTo(waitlistPosition.current)}
                    style={({ pressed }) => [styles.desktopNavCta, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.desktopNavCtaText}>JOIN WAITLIST</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  accessibilityLabel={menuOpen ? 'Close menu' : 'Open menu'}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: menuOpen }}
                  hitSlop={10}
                  onPress={() => setMenuOpen((open) => !open)}
                  style={({ pressed }) => [styles.menuButton, pressed && styles.buttonPressed]}
                >
                  <MenuIcon />
                </Pressable>
              )}
            </View>

            {!isDesktop && menuOpen ? (
              <View style={[styles.mobileMenu, isTablet && styles.mobileMenuTablet]}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => scrollTo(howItWorksPosition.current)}
                  style={({ pressed }) => [styles.mobileMenuItem, pressed && styles.mobileMenuItemPressed]}
                >
                  <Text style={styles.mobileMenuItemText}>HOW IT WORKS</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => scrollTo(waitlistPosition.current)}
                  style={({ pressed }) => [styles.mobileMenuItem, pressed && styles.mobileMenuItemPressed]}
                >
                  <Text style={styles.mobileMenuItemText}>JOIN WAITLIST</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.hero,
              {
                minHeight: Math.max(
                  viewportHeight - responsiveHeaderHeight,
                  isDesktop ? 700 : 0,
                ),
              },
            ]}
          >
            <TextileBackground columns={patternColumns} count={isDesktop ? 3 : 5} />

            <View
              style={[
                styles.heroContent,
                isTablet && styles.heroContentTablet,
                isDesktop && styles.heroContentDesktop,
              ]}
            >
              <View style={[styles.heroCopy, isDesktop && styles.heroCopyDesktop]}>
                <Text style={[styles.eyebrow, isDesktop && styles.eyebrowDesktop]}>
                  AFRICA&apos;S STORYTELLING PLATFORM
                </Text>

                {isDesktop ? (
                  <View style={[styles.headlineGroup, styles.headlineGroupDesktop]}>
                    <Text
                      style={[
                        styles.headline,
                        styles.headlineDesktop,
                        !isWideDesktop && styles.headlineCompactDesktop,
                      ]}
                    >
                      STORIES THAT
                    </Text>
                    <Text
                      style={[
                        styles.headline,
                        styles.headlineDesktop,
                        !isWideDesktop && styles.headlineCompactDesktop,
                      ]}
                    >
                      LIVE WITH YOU
                    </Text>
                    <Text
                      style={[
                        styles.headline,
                        styles.headlineDesktop,
                        !isWideDesktop && styles.headlineCompactDesktop,
                        styles.headlineAccent,
                      ]}
                    >
                      FOREVER
                    </Text>
                  </View>
                ) : (
                  <View style={styles.headlineGroup}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={[styles.headline, isTablet && styles.headlineTablet]}
                    >
                      STORIES THAT LIVE
                    </Text>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={[styles.headline, isTablet && styles.headlineTablet]}
                    >
                      WITH YOU <Text style={styles.headlineAccent}>FOREVER</Text>
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.supportingCopy,
                    isTablet && styles.supportingCopyTablet,
                    isDesktop && styles.supportingCopyDesktop,
                  ]}
                >
                  Empowering the next generation with vibrant digital libraries inspired by the rhythmic spirit of African folklore.
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => scrollTo(waitlistPosition.current)}
                  style={({ pressed }) => [
                    styles.waitlistButton,
                    isDesktop && styles.waitlistButtonDesktop,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={[styles.waitlistButtonText, isDesktop && styles.waitlistButtonTextDesktop]}>
                    JOIN WAITLIST
                  </Text>
                </Pressable>
              </View>

              <Image
                accessibilityLabel="Juma surrounded by flowing musical magic in an African village"
                contentFit="cover"
                source={jumaArtwork}
                style={[
                  styles.jumaArtwork,
                  isTablet && styles.jumaArtworkTablet,
                  isDesktop && styles.jumaArtworkDesktop,
                ]}
              />
            </View>
          </View>

          <PatternDivider columns={patternColumns} />

          <View style={styles.trustSection}>
            <View style={[styles.trustContent, isTablet && styles.trustContentTablet]}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={[styles.trustHeading, isTablet && styles.trustHeadingTablet]}
              >
                TRUSTED BY PARENTS ACROSS AFRICA
              </Text>
              <Image
                accessibilityLabel="Trusted, safe, loved, and educational"
                contentFit="contain"
                source={trustedByIcons}
                style={[styles.trustedByIcons, isTablet && styles.trustedByIconsTablet]}
              />
            </View>
          </View>

          <PatternDivider columns={patternColumns} />

          <View
            onLayout={(event) => {
              howItWorksPosition.current = event.nativeEvent.layout.y
            }}
            style={[styles.howItWorksSection, isTablet && styles.howItWorksSectionTablet]}
          >
            <Text style={[styles.howItWorksHeading, isTablet && styles.howItWorksHeadingTablet]}>
              HOW IT WORKS
            </Text>
            <View style={styles.headingUnderline} />

            <View style={[styles.cards, isTablet && styles.cardsTablet]}>
              {howItWorksItems.map((item) => (
                <View
                  key={item.title}
                  style={[
                    styles.howItWorksCard,
                    isTablet && styles.howItWorksCardTablet,
                    isDesktop && styles.howItWorksCardDesktop,
                    { borderBottomColor: item.accent },
                  ]}
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

          <PatternDivider columns={patternColumns} />

          <View
            onLayout={(event) => {
              waitlistPosition.current = event.nativeEvent.layout.y
            }}
            style={[styles.waitlistSection, isDesktop && styles.waitlistSectionDesktop]}
          >
            <TextileBackground columns={patternColumns} count={4} opacity={0.1} />

            <View style={[styles.waitlistContent, isDesktop && styles.waitlistContentDesktop]}>
              <View style={[styles.waitlistIntro, isDesktop && styles.waitlistIntroDesktop]}>
                <Text style={[styles.waitlistHeading, isDesktop && styles.waitlistHeadingDesktop]}>
                  JOIN OUR WAITLIST
                </Text>
                <Text style={[styles.waitlistCopy, isDesktop && styles.waitlistCopyDesktop]}>
                  Be the first to know when we launch and get exclusive early access to our premium collection.
                </Text>
              </View>

              <View style={[styles.waitlistForm, isDesktop && styles.waitlistFormDesktop]}>
                <View style={[styles.waitlistFields, isDesktop && styles.waitlistFieldsDesktop]}>
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
                    style={[styles.emailInput, isDesktop && styles.emailInputDesktop]}
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
                      isDesktop && styles.waitlistSubmitButtonDesktop,
                      pressed && styles.buttonPressed,
                      waitlistMutation.isSuccess && styles.waitlistSubmitButtonSuccess,
                    ]}
                  >
                    <Text style={[styles.waitlistSubmitText, isDesktop && styles.waitlistSubmitTextDesktop]}>
                      {waitlistMutation.isPending
                        ? 'JOINING…'
                        : waitlistMutation.isSuccess
                          ? 'YOU’RE ON THE LIST'
                          : 'JOIN WAITLIST TODAY'}
                    </Text>
                  </Pressable>
                </View>

                {waitlistStatus ? (
                  <Text
                    accessibilityLiveRegion="polite"
                    style={[
                      styles.waitlistStatus,
                      isDesktop && styles.waitlistStatusDesktop,
                      (emailError || waitlistMutation.isError) && styles.waitlistStatusError,
                    ]}
                  >
                    {waitlistStatus}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <PatternDivider columns={patternColumns} />

          <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
            <TextileBackground columns={patternColumns} count={5} opacity={0.07} />

            <View style={[styles.footerContent, isDesktop && styles.footerContentDesktop]}>
              <View style={[styles.footerMain, isDesktop && styles.footerMainDesktop]}>
                <View style={[styles.footerBrand, isDesktop && styles.footerBrandDesktop]}>
                  <Image
                    accessibilityLabel="Kanyah"
                    contentFit="contain"
                    source={kanyahLogoWhite}
                    style={styles.footerLogo}
                  />

                  <Text style={styles.footerTagline}>
                    Bringing the vibrant world of African storytelling to digital screens globally.
                  </Text>
                </View>

                <View style={[styles.footerGroups, isDesktop && styles.footerGroupsDesktop]}>
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
              </View>

              <View style={[styles.footerBottom, isDesktop && styles.footerBottomDesktop]}>
                <Image
                  accessibilityLabel="Website, share, and video links"
                  contentFit="contain"
                  source={socialPlaceholder}
                  style={[styles.socialLinks, isDesktop && styles.socialLinksDesktop]}
                />

                <Text style={[styles.copyright, isDesktop && styles.copyrightDesktop]}>
                  © 2026 Kanyah, a MESRAC project. All rights reserved.
                </Text>
              </View>
            </View>
          </View>

          <PatternDivider columns={patternColumns} />
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
  devBanner: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: colors.white,
  },
  devBannerTablet: {
    minHeight: 200,
    paddingHorizontal: 48,
    paddingVertical: 44,
  },
  devBannerText: {
    color: colors.headline,
    fontFamily: displayFont,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
    textAlign: 'center',
  },
  devBannerTextTablet: {
    fontSize: 60,
    lineHeight: 68,
  },
  header: {
    minHeight: 100,
    position: 'relative',
    zIndex: 20,
    backgroundColor: colors.warmHeader,
  },
  headerTablet: {
    minHeight: 108,
  },
  headerInner: {
    minHeight: 100,
    width: '100%',
    maxWidth: 1200,
    zIndex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  headerInnerTablet: {
    minHeight: 108,
    paddingHorizontal: 34,
  },
  textileBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  textileBackgroundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
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
  logoTablet: {
    width: 166,
    height: 92,
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
  desktopNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 34,
  },
  desktopNavLink: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  desktopNavLinkText: {
    color: colors.headline,
    fontFamily: bodyFont,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.35,
    lineHeight: 20,
  },
  desktopNavCta: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.orange,
    paddingHorizontal: 27,
    paddingVertical: 12,
  },
  desktopNavCtaText: {
    color: colors.white,
    fontFamily: displayFont,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
  },
  mobileMenu: {
    width: 250,
    position: 'absolute',
    top: 88,
    right: 16,
    zIndex: 30,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: colors.purpleFooter,
    padding: 8,
    shadowColor: colors.headline,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  mobileMenuTablet: {
    top: 98,
    right: 34,
  },
  mobileMenuItem: {
    minHeight: 52,
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  mobileMenuItemPressed: {
    backgroundColor: 'rgba(247, 201, 109, 0.16)',
  },
  mobileMenuItemText: {
    color: '#F8EFF5',
    fontFamily: bodyFont,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    lineHeight: 20,
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
  heroContentTablet: {
    paddingHorizontal: 40,
    paddingTop: 82,
    paddingBottom: 82,
  },
  heroContentDesktop: {
    width: '100%',
    maxWidth: 1200,
    minHeight: 700,
    zIndex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 68,
    paddingHorizontal: 48,
    paddingTop: 72,
    paddingBottom: 72,
  },
  heroCopy: {
    width: '100%',
    alignItems: 'center',
  },
  heroCopyDesktop: {
    width: 'auto',
    flex: 1.08,
    minWidth: 0,
    alignItems: 'flex-start',
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
  eyebrowDesktop: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'left',
  },
  headlineGroup: {
    width: '100%',
    marginTop: 27,
  },
  headlineGroupDesktop: {
    marginTop: 24,
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
  headlineTablet: {
    fontSize: 50,
    lineHeight: 60,
  },
  headlineDesktop: {
    fontSize: 66,
    letterSpacing: -1.8,
    lineHeight: 69,
    textAlign: 'left',
  },
  headlineCompactDesktop: {
    fontSize: 55,
    lineHeight: 59,
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
  supportingCopyTablet: {
    maxWidth: 540,
    fontSize: 22,
    lineHeight: 34,
  },
  supportingCopyDesktop: {
    maxWidth: 520,
    marginTop: 28,
    fontSize: 21,
    lineHeight: 33,
    textAlign: 'left',
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
  waitlistButtonDesktop: {
    width: 'auto',
    minWidth: 282,
    minHeight: 68,
    alignSelf: 'flex-start',
    marginTop: 38,
    paddingHorizontal: 34,
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
  waitlistButtonTextDesktop: {
    fontSize: 27,
    lineHeight: 32,
  },
  jumaArtwork: {
    width: '100%',
    maxWidth: 420,
    aspectRatio: 356 / 266,
    marginTop: 56,
    overflow: 'hidden',
    borderRadius: 23,
  },
  jumaArtworkTablet: {
    maxWidth: 620,
  },
  jumaArtworkDesktop: {
    flex: 0.92,
    width: '48%',
    maxWidth: 540,
    marginTop: 0,
    borderRadius: 30,
  },
  patternDivider: {
    height: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: colors.yellow,
  },
  patternDividerImage: {
    flex: 1,
    height: 44,
  },
  trustSection: {
    alignItems: 'center',
    backgroundColor: colors.palePeach,
    paddingHorizontal: 22,
    paddingTop: 48,
    paddingBottom: 38,
  },
  trustContent: {
    width: '100%',
    alignItems: 'center',
  },
  trustContentTablet: {
    maxWidth: 1080,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 48,
    paddingVertical: 8,
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
  trustHeadingTablet: {
    width: 'auto',
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'left',
  },
  trustedByIcons: {
    width: '100%',
    maxWidth: 358,
    aspectRatio: 358 / 68,
    marginTop: 25,
  },
  trustedByIconsTablet: {
    width: 'auto',
    flex: 1,
    maxWidth: 430,
    marginTop: 0,
  },
  howItWorksSection: {
    alignItems: 'center',
    backgroundColor: colors.palePeach,
    paddingHorizontal: 18,
    paddingTop: 82,
    paddingBottom: 72,
  },
  howItWorksSectionTablet: {
    paddingHorizontal: 34,
    paddingTop: 104,
    paddingBottom: 108,
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
  howItWorksHeadingTablet: {
    fontSize: 50,
    lineHeight: 58,
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
  cardsTablet: {
    maxWidth: 1200,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginTop: 68,
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
  howItWorksCardTablet: {
    width: '47%',
    minHeight: 350,
    flexGrow: 1,
    paddingHorizontal: 32,
  },
  howItWorksCardDesktop: {
    width: '31%',
    maxWidth: 384,
    minHeight: 410,
    flexGrow: 1,
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
  waitlistSectionDesktop: {
    minHeight: 510,
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingTop: 88,
    paddingBottom: 88,
  },
  waitlistContent: {
    width: '100%',
    maxWidth: 440,
    zIndex: 1,
    alignItems: 'center',
  },
  waitlistContentDesktop: {
    maxWidth: 1200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 74,
  },
  waitlistIntro: {
    width: '100%',
    alignItems: 'center',
  },
  waitlistIntroDesktop: {
    width: 'auto',
    flex: 0.85,
    minWidth: 0,
    alignItems: 'flex-start',
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
  waitlistHeadingDesktop: {
    fontSize: 50,
    lineHeight: 57,
    textAlign: 'left',
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
  waitlistCopyDesktop: {
    maxWidth: 480,
    fontSize: 20,
    lineHeight: 31,
    textAlign: 'left',
  },
  waitlistForm: {
    width: '100%',
    marginTop: 49,
    gap: 22,
  },
  waitlistFormDesktop: {
    width: 'auto',
    flex: 1.15,
    maxWidth: 650,
    marginTop: 0,
    gap: 16,
  },
  waitlistFields: {
    width: '100%',
    gap: 22,
  },
  waitlistFieldsDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
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
  emailInputDesktop: {
    width: 'auto',
    minWidth: 0,
    flex: 1,
    minHeight: 72,
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
  waitlistSubmitButtonDesktop: {
    width: 242,
    minHeight: 72,
    flexShrink: 0,
    paddingHorizontal: 18,
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
  waitlistSubmitTextDesktop: {
    fontSize: 18,
    lineHeight: 24,
  },
  waitlistStatus: {
    color: '#EAF8EE',
    fontFamily: bodyFont,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  waitlistStatusDesktop: {
    textAlign: 'left',
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
  footerDesktop: {
    minHeight: 510,
    paddingHorizontal: 48,
    paddingTop: 88,
    paddingBottom: 58,
  },
  footerContent: {
    width: '100%',
    maxWidth: 440,
    zIndex: 1,
    alignSelf: 'center',
  },
  footerContentDesktop: {
    maxWidth: 1200,
  },
  footerMain: {
    width: '100%',
  },
  footerMainDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 96,
  },
  footerBrand: {
    width: '100%',
  },
  footerBrandDesktop: {
    width: 'auto',
    maxWidth: 460,
    flex: 1,
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
  footerGroupsDesktop: {
    width: 'auto',
    maxWidth: 500,
    flex: 1,
    gap: 70,
    marginTop: 16,
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
  footerBottom: {
    width: '100%',
  },
  footerBottomDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 48,
    marginTop: 76,
  },
  socialLinksDesktop: {
    width: 260,
    marginTop: 0,
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
  copyrightDesktop: {
    marginTop: 0,
    textAlign: 'right',
  },
})
