import { router, useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect, useState } from 'react'
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native'

import { verifyParentPassword, verifyParentPin } from '@/features/auth/api/auth'
import {
  AuthBackButton,
  AuthField,
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
  const [method, setMethod] = useState<'password' | 'pin'>('pin')
  const [password, setPassword] = useState('')
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
        if (method === 'pin') {
          await verifyParentPin(pin)
        } else {
          await verifyParentPassword(password)
        }
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
          <Text style={styles.subtitle}>
            {method === 'pin'
              ? 'Enter your four-digit Parent PIN.'
              : 'Use your Kanyah account password instead.'}
          </Text>
        </View>

        {method === 'pin' ? (
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
        ) : (
          <AuthField
            autoCapitalize="none"
            autoComplete="current-password"
            editable={!isSubmitting}
            error={getApiFieldError(error, 'password')}
            icon="lock"
            label="ACCOUNT PASSWORD"
            onChangeText={(value) => {
              setPassword(value)
              setError(null)
            }}
            passwordToggle
            placeholder="Enter your password"
            textContentType="password"
            value={password}
          />
        )}

        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {getApiErrorMessage(error, 'We could not verify your Parent PIN.')}
          </Text>
        ) : null}

        <AuthPrimaryButton
          disabled={(method === 'pin' ? pin.length !== 4 : !password) || isSubmitting}
          label={isSubmitting ? 'CHECKING…' : 'UNLOCK'}
          onPress={() => void unlock()}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMethod((current) => (current === 'pin' ? 'password' : 'pin'))
            setError(null)
          }}
          style={({ pressed }) => [styles.recoveryButton, pressed && styles.pressed]}
        >
          <Text style={styles.recoveryText}>
            {method === 'pin' ? 'Forgot PIN? Use account password' : 'Use Parent PIN instead'}
          </Text>
        </Pressable>
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
  recoveryButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryText: {
    color: appColors.actions.secondary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
})
