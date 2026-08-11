import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '@/features/auth/context/auth-context'
import { ChildAppShell } from '@/features/navigation/components/child-app-shell'
import { ProfileAvatar } from '@/features/profiles/components/profile-avatar'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

export default function ChildProfileScreen() {
  const { activeProfile, isRestoring, readerMode, user } = useAuth()

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    } else if (!isRestoring && user && (readerMode !== 'child' || !activeProfile)) {
      router.replace(readerMode === 'parent' ? '/account' : '/who-is-reading')
    }
  }, [activeProfile, isRestoring, readerMode, user])

  const profileName = activeProfile?.display_name ?? 'Reader'

  return (
    <ChildAppShell activeTab="profile">
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text accessibilityRole="header" style={styles.pageTitle}>
          MY PROFILE
        </Text>

        <View style={styles.identity}>
          <ProfileAvatar
            avatar={activeProfile?.avatar_key ?? 'explorer'}
            imageUrl={activeProfile?.avatar_url}
            selected
            size={112}
          />
          <Text style={styles.journeyTitle}>{profileName.toUpperCase()}&apos;S JOURNEY</Text>
          <Text style={styles.journeyBody}>
            Your reading history, badges and achievements will grow here.
          </Text>
        </View>

        <View style={styles.comingSoonCard}>
          <SymbolView
            name={{ ios: 'medal.fill', android: 'military_tech', web: 'military_tech' }}
            size={28}
            tintColor={appPalette.colors.primary[500]}
          />
          <View style={styles.comingSoonCopy}>
            <Text style={styles.comingSoonTitle}>YOUR JOURNEY STARTS HERE</Text>
            <Text style={styles.comingSoonBody}>
              Finish stories to begin building your history and achievements.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityHint="Requires the Parent PIN on shared and child devices"
          accessibilityRole="button"
          onPress={() => router.push('/parent-unlock')}
          style={({ pressed }) => [styles.parentButton, pressed && styles.pressed]}
        >
          <SymbolView
            name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
            size={20}
            tintColor={appColors.actions.secondary}
          />
          <View style={styles.parentCopy}>
            <Text style={styles.parentTitle}>PARENT AREA</Text>
            <Text style={styles.parentBody}>Profiles, settings and family controls</Text>
          </View>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={20}
            tintColor={appColors.actions.secondary}
          />
        </Pressable>
      </ScrollView>
    </ChildAppShell>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 126,
  },
  pageTitle: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 38,
    textAlign: 'center',
  },
  identity: {
    alignItems: 'center',
    marginTop: 30,
  },
  journeyTitle: {
    marginTop: 18,
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 38,
    textAlign: 'center',
  },
  journeyBody: {
    maxWidth: 310,
    marginTop: 7,
    color: appColors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  comingSoonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 34,
    padding: 18,
    borderRadius: 20,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 8px 18px rgba(90, 52, 28, 0.1)',
  },
  comingSoonCopy: {
    flex: 1,
  },
  comingSoonTitle: {
    color: appColors.text.primary,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  comingSoonBody: {
    marginTop: 3,
    color: appColors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  parentButton: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 18,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: appPalette.colors.secondary[100],
    borderRadius: 20,
    backgroundColor: appPalette.colors.secondary[10],
  },
  parentCopy: {
    flex: 1,
  },
  parentTitle: {
    color: appColors.actions.secondary,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  parentBody: {
    marginTop: 2,
    color: appColors.text.secondary,
    fontSize: 12,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.72,
  },
})
