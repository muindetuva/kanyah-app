import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import type { ReactNode } from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import { KanyahScreenBackground } from '@/components/kanyah-screen-background'
import { MobileFrame } from '@/components/mobile-frame'
import { appColors, appPalette } from '@/theme/colors'

export type ChildAppTab = 'home' | 'new' | 'profile' | 'stories' | 'watch'

const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: { ios: 'house.fill' as const, android: 'home' as const, web: 'home' as const },
    route: '/home' as const,
  },
  {
    id: 'watch',
    label: 'Watch',
    icon: {
      ios: 'play.rectangle.fill' as const,
      android: 'smart_display' as const,
      web: 'smart_display' as const,
    },
  },
  {
    id: 'stories',
    label: 'Stories',
    icon: {
      ios: 'book.closed.fill' as const,
      android: 'menu_book' as const,
      web: 'menu_book' as const,
    },
    route: '/stories' as const,
  },
  {
    id: 'new',
    label: 'New',
    icon: { ios: 'star.fill' as const, android: 'star' as const, web: 'star' as const },
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: {
      ios: 'face.smiling' as const,
      android: 'mood' as const,
      web: 'mood' as const,
    },
    route: '/who-is-reading' as const,
  },
] as const

type ChildBottomNavigationProps = {
  activeTab: ChildAppTab
}

function ChildBottomNavigation({ activeTab }: ChildBottomNavigationProps) {
  return (
    <View accessibilityRole="tablist" style={styles.navigation}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab
        const central = tab.id === 'stories'
        const disabled = !('route' in tab)
        const iconColor = central
          ? appColors.text.onPrimary
          : active
            ? appPalette.colors.yellow[100]
            : tab.id === 'new'
              ? appPalette.colors.magenta[300]
              : appPalette.colors.purple[100]

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ disabled, selected: active }}
            disabled={disabled}
            key={tab.id}
            onPress={() => {
              if ('route' in tab) {
                router.replace(tab.route)
              }
            }}
            style={({ pressed }) => [
              styles.tab,
              central && styles.centralTab,
              pressed && styles.tabPressed,
            ]}
          >
            <View style={[styles.iconFrame, central && styles.centralIconFrame]}>
              <SymbolView name={tab.icon} size={central ? 29 : 23} tintColor={iconColor} />
            </View>
            <Text
              style={[
                styles.tabLabel,
                active && styles.tabLabelActive,
                central && styles.centralTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

type ChildAppShellProps = {
  activeTab: ChildAppTab
  children: ReactNode
}

export function ChildAppShell({ activeTab, children }: ChildAppShellProps) {
  return (
    <MobileFrame
      backgroundColor={appPalette.colors.neutral[1000]}
      frameColor={appColors.backgrounds.secondary}
    >
      <KanyahScreenBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>{children}</View>
          <ChildBottomNavigation activeTab={activeTab} />
        </SafeAreaView>
      </KanyahScreenBackground>
    </MobileFrame>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  navigation: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    left: 14,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderRadius: 36,
    backgroundColor: appPalette.colors.deepIndigo[500],
    boxShadow: '0 10px 24px rgba(34, 19, 55, 0.24)',
  },
  tab: {
    width: '20%',
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralTab: {
    transform: [{ translateY: -17 }],
  },
  iconFrame: {
    width: 34,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralIconFrame: {
    width: 62,
    height: 62,
    borderWidth: 4,
    borderColor: appPalette.colors.primary[100],
    borderRadius: 31,
    backgroundColor: appColors.actions.primary,
  },
  tabLabel: {
    marginTop: 2,
    color: appPalette.colors.purple[100],
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: appPalette.colors.yellow[100],
  },
  centralTabLabel: {
    marginTop: 2,
    color: appColors.text.onPrimary,
  },
  tabPressed: {
    opacity: 0.72,
  },
})
