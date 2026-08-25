import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  AuthBackButton,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/components/auth-ui'
import { useAuth } from '@/features/auth/context/auth-context'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

const guidance = [
  {
    body: 'Each reader chooses their own profile from “Who’s Reading?” when Kanyah opens.',
    icon: {
      ios: 'hand.raised.fill' as const,
      android: 'waving_hand' as const,
      web: 'waving_hand' as const,
    },
    title: 'CHOOSING A PROFILE',
  },
  {
    body: 'Choose Parent when you want to switch back, then enter your Parent PIN.',
    icon: {
      ios: 'lock.fill' as const,
      android: 'lock' as const,
      web: 'lock' as const,
    },
    title: 'SWITCHING BACK',
  },
]

export default function SharedDeviceReadyScreen() {
  const { deviceMode, isRestoring, user } = useAuth()

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    } else if (!isRestoring && user && deviceMode !== 'shared') {
      router.replace('/device-setup')
    }
  }, [deviceMode, isRestoring, user])

  return (
    <AuthShell contentStyle={styles.scrollContent}>
      <AuthBackButton onPress={() => router.replace('/device-setup')} />

      <View style={styles.panel}>
        <View style={styles.badge}>
          <SymbolView
            name={{ ios: 'person.2.fill', android: 'groups', web: 'groups' }}
            size={30}
            tintColor={appColors.text.onPrimary}
          />
        </View>

        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            READY TO SHARE
          </Text>
          <Text style={styles.subtitle}>Here’s how profiles work on this device.</Text>
        </View>

        <View style={styles.guidanceList}>
          {guidance.map((item) => (
            <View key={item.title} style={styles.guidanceItem}>
              <View style={styles.guidanceIcon}>
                <SymbolView
                  name={item.icon}
                  size={23}
                  tintColor={appPalette.colors.primary[500]}
                />
              </View>
              <View style={styles.guidanceCopy}>
                <Text style={styles.guidanceTitle}>{item.title}</Text>
                <Text style={styles.guidanceBody}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <AuthPrimaryButton
          label="CHOOSE WHO’S READING"
          onPress={() => router.replace('/who-is-reading')}
        />
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  panel: {
    position: 'relative',
    gap: 28,
    marginTop: 96,
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 24,
    borderRadius: 28,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 14px 28px rgba(90, 52, 28, 0.13)',
  },
  badge: {
    position: 'absolute',
    top: -34,
    alignSelf: 'center',
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: appPalette.grays.white,
    borderRadius: 34,
    backgroundColor: appPalette.colors.primary[500],
    boxShadow: '0 6px 14px rgba(90, 52, 28, 0.2)',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 40,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 7,
    color: appColors.text.secondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  guidanceList: {
    gap: 22,
  },
  guidanceItem: {
    flexDirection: 'row',
    gap: 14,
  },
  guidanceIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: appPalette.colors.primary[10],
  },
  guidanceCopy: {
    flex: 1,
  },
  guidanceTitle: {
    color: appColors.text.primary,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  guidanceBody: {
    marginTop: 3,
    color: appColors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
})
