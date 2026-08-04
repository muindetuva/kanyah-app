import { router } from 'expo-router'
import { useState } from 'react'
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native'

import {
  AuthBackButton,
  AuthField,
  AuthPrimaryButton,
  AuthShell,
} from '@/features/auth/components/auth-ui'
import { useAuth } from '@/features/auth/context/auth-context'
import { getApiErrorMessage, getApiFieldError } from '@/lib/api/client'
import { appColors, appPalette } from '@/theme/colors'
import { appTypography } from '@/theme/typography'

function goBack() {
  if (router.canGoBack()) {
    router.back()
    return
  }

  router.replace('/')
}

export default function LoginScreen() {
  const [error, setError] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const { login } = useAuth()

  async function handleSubmit() {
    Keyboard.dismiss()
    setError(null)
    setIsSubmitting(true)

    try {
      const user = await login({ phone, password })
      router.replace(user.child_profiles.length === 0 ? '/create-profile' : '/who-is-reading')
    } catch (submissionError) {
      setError(submissionError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell contentStyle={styles.scrollContent}>
      <AuthBackButton onPress={goBack} />

      <View style={styles.card}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            WELCOME BACK
          </Text>
          <Text style={styles.subtitle}>Continue your storybook{`\n`}adventure.</Text>
        </View>

        <View style={styles.form}>
          <AuthField
            autoComplete="tel"
            editable={!isSubmitting}
            error={getApiFieldError(error, 'phone')}
            icon="phone"
            keyboardType="phone-pad"
            label="PHONE NUMBER"
            onChangeText={setPhone}
            placeholder="+254 712345678"
            returnKeyType="next"
            textContentType="telephoneNumber"
            value={phone}
          />
          <View>
            <AuthField
              autoCapitalize="none"
              autoComplete="current-password"
              editable={!isSubmitting}
              error={getApiFieldError(error, 'password')}
              icon="lock"
              label="PASSWORD"
              onChangeText={setPassword}
              passwordToggle
              placeholder="Enter your password"
              returnKeyType="done"
              textContentType="password"
              value={password}
            />
            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              onPress={Keyboard.dismiss}
              style={({ pressed }) => [styles.forgotButton, pressed && styles.pressed]}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>
        </View>

        {error ? (
          <Text accessibilityRole="alert" style={styles.submissionError}>
            {getApiErrorMessage(error, 'We could not log you in. Please try again.')}
          </Text>
        ) : null}

        <AuthPrimaryButton
          disabled={isSubmitting}
          label={isSubmitting ? 'LOGGING IN…' : 'LOG IN'}
          onPress={() => void handleSubmit()}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => router.replace('/signup')}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.footerLink}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
  },
  card: {
    marginTop: 108,
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 24,
    borderRadius: 28,
    backgroundColor: appPalette.grays.white,
    boxShadow: '0 14px 28px rgba(90, 52, 28, 0.13)',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: appColors.text.primary,
    fontFamily: appTypography.displayFont,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 42,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    color: appPalette.colors.brown[500],
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    gap: 18,
    marginTop: 30,
    marginBottom: 24,
  },
  submissionError: {
    marginBottom: 14,
    color: appPalette.colors.primary[500],
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    minHeight: 38,
    justifyContent: 'center',
  },
  forgotText: {
    color: appColors.actions.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  footerRow: {
    minHeight: 44,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  footerText: {
    color: appPalette.colors.brown[500],
    fontSize: 14,
    lineHeight: 20,
  },
  footerLink: {
    color: appColors.actions.primary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
})
