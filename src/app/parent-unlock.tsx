import { router, useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect, useState } from 'react'
import { Keyboard, StyleSheet, Text, View } from 'react-native'

import { verifyParentPin } from '@/features/auth/api/auth'
import {
  AuthBackButton,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/components/auth-ui'
import { ParentPinInput } from '@/features/auth/components/parent-pin-input'
import { useAuth } from '@/features/auth/context/auth-context'
import { getApiErrorMessage, getApiFieldError } from '@/lib/api/client'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

export default function ParentUnlockScreen() {
  const { next } = useLocalSearchParams<{ next?: string }>()
  const [error, setError] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingDestination, setPendingDestination] = useState<
    'create-profile' | 'parent-home' | null
  >(null)
  const [pin, setPin] = useState('')
  const { activeProfile, deviceMode, isRestoring, readerMode, selectParent, user } = useAuth()

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    }
  }, [isRestoring, user])

  useEffect(() => {
    if (!pendingDestination || readerMode !== 'parent') {
      return
    }

    router.replace(
      pendingDestination === 'create-profile' ? '/create-profile' : '/parent-home',
    )
  }, [pendingDestination, readerMode])

  function goBack() {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace(activeProfile ? '/home' : '/who-is-reading')
    }
  }

  async function unlock() {
    if (!user) {
      return
    }

    Keyboard.dismiss()
    setError(null)
    setIsSubmitting(true)

    try {
      if (deviceMode !== 'parent') {
        await verifyParentPin(pin)
      }

      setPendingDestination(next === 'create-profile' ? 'create-profile' : 'parent-home')
      selectParent()
    } catch (submissionError) {
      setError(submissionError)
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell contentStyle={styles.scrollContent}>
      <AuthBackButton onPress={goBack} />

      <View style={styles.card}>
        <View style={styles.lockBadge}>
          <SymbolView
            name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
            size={30}
            tintColor={appColors.text.onPrimary}
          />
        </View>

        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            PARENT ACCESS
          </Text>
          <Text style={styles.subtitle}>Enter your four-digit Parent PIN.</Text>
        </View>

        <ParentPinInput
          autoFocus
          disabled={isSubmitting}
          error={getApiFieldError(error, 'pin')}
          label="ENTER PARENT PIN"
          onChange={(value) => {
            setPin(value)
            setError(null)
          }}
          value={pin}
        />

        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {getApiErrorMessage(error, 'We could not verify your Parent PIN.')}
          </Text>
        ) : null}

        <AuthPrimaryButton
          disabled={pin.length !== 4 || isSubmitting}
          label={isSubmitting ? 'CHECKING…' : 'UNLOCK'}
          onPress={() => void unlock()}
        />
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  card: {
    position: 'relative',
    gap: 24,
    marginTop: 108,
    paddingHorizontal: 26,
    paddingTop: 54,
    paddingBottom: 22,
    borderRadius: 28,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 14px 28px rgba(90, 52, 28, 0.13)',
  },
  lockBadge: {
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
    backgroundColor: appPalette.colors.deepIndigo[500],
    boxShadow: '0 6px 14px rgba(34, 19, 55, 0.22)',
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
    marginTop: 6,
    color: appColors.text.secondary,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  error: {
    color: appPalette.colors.primary[500],
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
})
