import { router, type Href } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import type { ComponentProps, ReactNode } from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import { KanyahScreenBackground } from '@/components/kanyah-screen-background'
import { MobileFrame } from '@/components/mobile-frame'
import { appColors, appPalette } from '@/theme/colors'

export type ChildAppTab = 'home' | 'new' | 'profile' | 'stories' | 'watch'
export type ParentAppTab = 'analytics' | 'home' | 'profile' | 'stories' | 'watch'

type NavigationTab = {
  icon: ComponentProps<typeof SymbolView>['name']
  id: ChildAppTab | ParentAppTab
  label: string
  route?: Href
}

const childTabs = [
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
] as const satisfies readonly NavigationTab[]

const parentTabs = [
  {
    id: 'home',
    label: 'Home',
    icon: { ios: 'house.fill' as const, android: 'home' as const, web: 'home' as const },
    route: '/parent-home' as const,
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
    id: 'analytics',
    label: 'Analytics',
    icon: {
      ios: 'chart.bar.fill' as const,
      android: 'bar_chart' as const,
      web: 'bar_chart' as const,
    },
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: {
      ios: 'person.crop.circle.fill' as const,
      android: 'account_circle' as const,
      web: 'account_circle' as const,
    },
    route: '/who-is-reading' as const,
  },
] as const satisfies readonly NavigationTab[]

type BottomNavigationProps = {
  activeTab: ChildAppTab | ParentAppTab
  mode: 'child' | 'parent'
}

function BottomNavigation({ activeTab, mode }: BottomNavigationProps) {
  const tabs = mode === 'parent' ? parentTabs : childTabs

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
                if (tab.id === 'profile') {
                  router.push(tab.route)
                } else {
                  router.navigate(tab.route)
                }
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

type AppShellProps = {
  activeTab: ChildAppTab | ParentAppTab
  children: ReactNode
  mode: 'child' | 'parent'
}

function AppShell({ activeTab, children, mode }: AppShellProps) {
  return (
    <MobileFrame
      backgroundColor={appPalette.colors.neutral[1000]}
      frameColor={appColors.backgrounds.secondary}
    >
      <KanyahScreenBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>{children}</View>
          <BottomNavigation activeTab={activeTab} mode={mode} />
        </SafeAreaView>
      </KanyahScreenBackground>
    </MobileFrame>
  )
}

type ChildAppShellProps = {
  activeTab: ChildAppTab
  children: ReactNode
}

export function ChildAppShell({ activeTab, children }: ChildAppShellProps) {
  return (
    <AppShell activeTab={activeTab} mode="child">
      {children}
    </AppShell>
  )
}

type ParentAppShellProps = {
  activeTab: ParentAppTab
  children: ReactNode
}

export function ParentAppShell({ activeTab, children }: ParentAppShellProps) {
  return (
    <AppShell activeTab={activeTab} mode="parent">
      {children}
    </AppShell>
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
