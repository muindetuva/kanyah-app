import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

import { useAuth } from '@/features/auth/context/auth-context'
import { ParentAppShell } from '@/features/navigation/components/child-app-shell'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

export default function AccountScreen() {
  const { deviceMode, isRestoring, logout, readerMode, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (!isRestoring && (!user || readerMode !== 'parent')) {
      router.replace(user ? '/who-is-reading' : '/login')
    }
  }, [isRestoring, readerMode, user])

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
    } catch {
      // Local credentials are cleared even when the server cannot be reached.
    } finally {
      router.replace('/')
      setIsLoggingOut(false)
    }
  }

  const deviceModeLabel =
    deviceMode === 'child'
      ? 'Child’s device'
      : deviceMode === 'shared'
        ? 'Shared family device'
        : 'Parent device'

  return (
    <ParentAppShell activeTab="profile">
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            PARENT PROFILE
          </Text>
          <Text style={styles.subtitle}>Manage your account and this device.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>NAME</Text>
            <Text style={styles.detailValue}>{user?.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PHONE NUMBER</Text>
            <Text style={styles.detailValue}>{user?.phone}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.deviceRow}>
            <View style={styles.deviceCopy}>
              <Text style={styles.detailLabel}>THIS DEVICE</Text>
              <Text style={styles.detailValue}>{deviceModeLabel}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/device-setup')}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.changeDeviceLabel}>CHANGE</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isLoggingOut}
          onPress={() => void handleLogout()}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <Text style={styles.logoutLabel}>{isLoggingOut ? 'LOGGING OUT…' : 'LOG OUT'}</Text>
        </Pressable>
      </ScrollView>
    </ParentAppShell>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 34,
    paddingBottom: 126,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 42,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 280,
    marginTop: 8,
    color: appPalette.colors.brown[500],
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  card: {
    marginTop: 42,
    borderRadius: 22,
    backgroundColor: appPalette.grays.white,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  detailRow: {
    gap: 5,
    paddingVertical: 18,
  },
  detailLabel: {
    color: appPalette.colors.neutral[700],
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  detailValue: {
    color: appColors.text.primary,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  deviceRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  deviceCopy: {
    flex: 1,
    gap: 5,
  },
  changeDeviceLabel: {
    color: appColors.actions.secondary,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: appPalette.colors.brown[100],
  },
  logoutButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    borderWidth: 2,
    borderColor: appColors.actions.primary,
    borderRadius: 999,
  },
  logoutLabel: {
    color: appColors.actions.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.72,
  },
})
