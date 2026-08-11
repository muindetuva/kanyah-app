import { router } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect, useState } from 'react'
import { Keyboard, StyleSheet, Text, View } from 'react-native'

import {
  AuthBackButton,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/components/auth-ui'
import { ParentPinInput } from '@/features/auth/components/parent-pin-input'
import { storeParentPin } from '@/features/auth/api/auth'
import { useAuth } from '@/features/auth/context/auth-context'
import { getApiErrorMessage, getApiFieldError } from '@/lib/api/client'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

export default function ParentPinScreen() {
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pin, setPin] = useState('')
  const [step, setStep] = useState<'confirm' | 'enter'>('enter')
  const { deviceMode, isRestoring, refreshUser, user } = useAuth()

  useEffect(() => {
    if (!isRestoring && !user) {
      router.replace('/login')
    } else if (!isRestoring && user && !deviceMode) {
      router.replace('/device-setup')
    }
  }, [deviceMode, isRestoring, user])

  function finishSetup() {
    if (deviceMode === 'shared') {
      router.replace('/shared-device-ready')
    } else if (deviceMode === 'child') {
      router.replace('/home')
    } else {
      router.replace('/parent-home')
    }
  }

  async function handleSubmit() {
    if (step === 'enter') {
      setConfirmation('')
      setError(null)
      setStep('confirm')
      return
    }

    if (pin !== confirmation) {
      setError(new Error('Those PINs do not match. Try again.'))
      setConfirmation('')
      return
    }

    Keyboard.dismiss()
    setError(null)
    setIsSubmitting(true)

    try {
      await storeParentPin(pin, confirmation)
      await refreshUser()
      finishSetup()
    } catch (submissionError) {
      setError(submissionError)
    } finally {
      setIsSubmitting(false)
    }
  }

  function goBack() {
    setError(null)

    if (step === 'confirm') {
      setStep('enter')
      return
    }

    router.replace('/device-setup')
  }

  const currentValue = step === 'enter' ? pin : confirmation
  const currentError = getApiFieldError(error, 'pin')

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
            {step === 'enter' ? 'SET A PARENT PIN' : 'CONFIRM YOUR PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'enter'
              ? 'Use four digits to open the parent area, change profiles and update settings.'
              : 'Enter the same four digits one more time.'}
          </Text>
        </View>

        <ParentPinInput
          autoFocus
          disabled={isSubmitting}
          error={currentError}
          label={step === 'enter' ? 'ENTER 4-DIGIT PIN' : 'ENTER PIN AGAIN'}
          onChange={(value) => {
            if (step === 'enter') {
              setPin(value)
            } else {
              setConfirmation(value)
            }
            setError(null)
          }}
          value={currentValue}
        />

        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {getApiErrorMessage(error, 'We could not save your Parent PIN.')}
          </Text>
        ) : null}

        <AuthPrimaryButton
          disabled={currentValue.length !== 4 || isSubmitting}
          label={
            isSubmitting
              ? 'SAVING PIN…'
              : step === 'enter'
                ? 'CONTINUE'
                : 'SET PARENT PIN'
          }
          onPress={() => void handleSubmit()}
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
  header: {
    alignItems: 'center',
  },
  card: {
    position: 'relative',
    gap: 28,
    marginTop: 102,
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 24,
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
    backgroundColor: appPalette.colors.primary[500],
    boxShadow: '0 6px 14px rgba(90, 52, 28, 0.2)',
  },
  title: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 42,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 320,
    marginTop: 8,
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
